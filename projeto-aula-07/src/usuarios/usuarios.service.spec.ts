import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './schemas/usuario.schema';

// findById(id).select('-senha') — a Query é "thenable", sem .exec().
function criarSelectMock(resultado: unknown) {
  return { select: jest.fn().mockResolvedValue(resultado) };
}

// find().select('-senha').exec() — aqui a cadeia termina em .exec().
function criarSelectExecMock(resultado: unknown) {
  return {
    select: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(resultado) }),
  };
}

describe('UsuariosService', () => {
  let service: UsuariosService;
  let usuarioModel: {
    create: jest.Mock;
    find: jest.Mock;
    findOne: jest.Mock;
    findById: jest.Mock;
  };

  beforeEach(async () => {
    usuarioModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        { provide: getModelToken(Usuario.name), useValue: usuarioModel },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('create deve persistir via Model.create e retornar o usuário sem a senha (via findOne)', async () => {
    const dto = {
      nome: 'Ana Torres',
      email: 'ana@empresa.com',
      senha: 'senai123',
    };
    usuarioModel.create.mockResolvedValue({ _id: 'abc123', ...dto });
    const semSenha = {
      _id: 'abc123',
      nome: 'Ana Torres',
      email: 'ana@empresa.com',
    };
    usuarioModel.findById.mockReturnValue(criarSelectMock(semSenha));

    const resultado = await service.create(dto);

    expect(usuarioModel.create).toHaveBeenCalledWith(dto);
    expect(usuarioModel.findById).toHaveBeenCalledWith('abc123');
    expect(resultado).toEqual(semSenha);
  });

  it('findAll deve listar usuários excluindo o campo senha', async () => {
    const lista = [{ nome: 'Ana Torres' }, { nome: 'Bruno Lima' }];
    usuarioModel.find.mockReturnValue(criarSelectExecMock(lista));

    const resultado = await service.findAll();

    expect(usuarioModel.find).toHaveBeenCalled();
    expect(resultado).toEqual(lista);
  });

  it('findOne deve retornar o usuário sem a senha', async () => {
    const usuario = { _id: 'abc123', nome: 'Ana Torres' };
    usuarioModel.findById.mockReturnValue(criarSelectMock(usuario));

    const resultado = await service.findOne('abc123');

    expect(usuarioModel.findById).toHaveBeenCalledWith('abc123');
    expect(resultado).toEqual(usuario);
  });

  it('findOne deve lançar NotFoundException para ID inexistente', async () => {
    usuarioModel.findById.mockReturnValue(criarSelectMock(null));

    await expect(service.findOne('64f0000000000000000000ab')).rejects.toThrow(
      new NotFoundException(
        'Usuário com ID 64f0000000000000000000ab não encontrado',
      ),
    );
  });

  it('update deve lançar NotFoundException quando o usuário não existe', async () => {
    usuarioModel.findById.mockResolvedValueOnce(null);

    await expect(
      service.update('64f0000000000000000000ab', { nome: 'X' }),
    ).rejects.toThrow(
      new NotFoundException(
        'Usuário com ID 64f0000000000000000000ab não encontrado',
      ),
    );
  });

  it('update deve aplicar os campos, chamar .save() e retornar via findOne', async () => {
    const save = jest.fn().mockResolvedValue(undefined);
    usuarioModel.findById.mockResolvedValueOnce({ nome: 'Ana Torres', save });
    const atualizado = { _id: 'abc123', nome: 'Ana Torres Silva' };
    usuarioModel.findById.mockReturnValueOnce(criarSelectMock(atualizado));

    const resultado = await service.update('abc123', {
      nome: 'Ana Torres Silva',
    });

    expect(save).toHaveBeenCalled();
    expect(resultado).toEqual(atualizado);
  });

  // Aula 29: Atividade Prática - "O Cofre de Identidades" (Verificação Extra).
  describe('validar', () => {
    it('deve retornar "Acesso Permitido" quando a senha bate com o hash salvo', async () => {
      const hash = await bcrypt.hash('senai123', await bcrypt.genSalt(4));
      usuarioModel.findOne.mockResolvedValue({
        email: 'ana@empresa.com',
        senha: hash,
      });

      const resultado = await service.validar('ana@empresa.com', 'senai123');

      expect(usuarioModel.findOne).toHaveBeenCalledWith({
        email: 'ana@empresa.com',
      });
      expect(resultado).toBe('Acesso Permitido');
    });

    it('deve retornar "Senha Incorreta" quando a senha não bate com o hash salvo', async () => {
      const hash = await bcrypt.hash('senai123', await bcrypt.genSalt(4));
      usuarioModel.findOne.mockResolvedValue({
        email: 'ana@empresa.com',
        senha: hash,
      });

      const resultado = await service.validar('ana@empresa.com', 'senhaErrada');

      expect(resultado).toBe('Senha Incorreta');
    });

    it('deve retornar "Senha Incorreta" quando o e-mail não existe (sem revelar a diferença)', async () => {
      usuarioModel.findOne.mockResolvedValue(null);

      const resultado = await service.validar(
        'naoexiste@empresa.com',
        'qualquer',
      );

      expect(resultado).toBe('Senha Incorreta');
    });
  });

  // Aula 30: base do AuthService.login() — precisa do documento do usuário
  // (não só de um texto de sucesso/falha) para montar o payload do JWT.
  describe('validarCredenciais', () => {
    it('deve retornar o documento do usuário quando a senha bate com o hash salvo', async () => {
      const hash = await bcrypt.hash('senai123', await bcrypt.genSalt(4));
      const usuario = { _id: 'abc123', email: 'ana@empresa.com', senha: hash };
      usuarioModel.findOne.mockResolvedValue(usuario);

      const resultado = await service.validarCredenciais(
        'ana@empresa.com',
        'senai123',
      );

      expect(resultado).toEqual(usuario);
    });

    it('deve retornar null quando a senha não bate', async () => {
      const hash = await bcrypt.hash('senai123', await bcrypt.genSalt(4));
      usuarioModel.findOne.mockResolvedValue({
        email: 'ana@empresa.com',
        senha: hash,
      });

      const resultado = await service.validarCredenciais(
        'ana@empresa.com',
        'senhaErrada',
      );

      expect(resultado).toBeNull();
    });

    it('deve retornar null quando o e-mail não existe', async () => {
      usuarioModel.findOne.mockResolvedValue(null);

      const resultado = await service.validarCredenciais(
        'naoexiste@empresa.com',
        'qualquer',
      );

      expect(resultado).toBeNull();
    });
  });
});
