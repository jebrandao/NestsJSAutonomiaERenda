import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

describe('UsuariosController', () => {
  let controller: UsuariosController;
  let usuariosService: {
    create: jest.Mock;
    findAll: jest.Mock;
    findOne: jest.Mock;
    update: jest.Mock;
    validar: jest.Mock;
    remover: jest.Mock;
  };

  beforeEach(async () => {
    usuariosService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      validar: jest.fn(),
      remover: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuariosController],
      providers: [{ provide: UsuariosService, useValue: usuariosService }],
    }).compile();

    controller = module.get<UsuariosController>(UsuariosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('criar deve delegar ao service', async () => {
    const dto = {
      nome: 'Ana Torres',
      email: 'ana@empresa.com',
      senha: 'senai123',
    };
    const criado = {
      _id: 'abc123',
      nome: 'Ana Torres',
      email: 'ana@empresa.com',
    };
    usuariosService.create.mockResolvedValue(criado);

    await expect(controller.criar(dto)).resolves.toEqual(criado);
    expect(usuariosService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll deve delegar ao service', async () => {
    const lista = [{ nome: 'Ana Torres' }];
    usuariosService.findAll.mockResolvedValue(lista);

    await expect(controller.findAll()).resolves.toEqual(lista);
  });

  it('buscarPorId deve delegar ao service', async () => {
    const usuario = { _id: 'abc123', nome: 'Ana Torres' };
    usuariosService.findOne.mockResolvedValue(usuario);

    await expect(controller.buscarPorId('abc123')).resolves.toEqual(usuario);
    expect(usuariosService.findOne).toHaveBeenCalledWith('abc123');
  });

  it('buscarPorId deve propagar NotFoundException para ID inexistente', async () => {
    usuariosService.findOne.mockRejectedValue(
      new NotFoundException(
        'Usuário com ID 64f0000000000000000000ab não encontrado',
      ),
    );

    await expect(
      controller.buscarPorId('64f0000000000000000000ab'),
    ).rejects.toThrow(NotFoundException);
  });

  it('atualizar deve delegar id e dto ao service', async () => {
    const dto = { nome: 'Ana Torres Silva' };
    const atualizado = { _id: 'abc123', nome: 'Ana Torres Silva' };
    usuariosService.update.mockResolvedValue(atualizado);

    await expect(controller.atualizar('abc123', dto)).resolves.toEqual(
      atualizado,
    );
    expect(usuariosService.update).toHaveBeenCalledWith('abc123', dto);
  });

  it('validar deve delegar email e senha ao service e retornar "Acesso Permitido"', async () => {
    usuariosService.validar.mockResolvedValue('Acesso Permitido');

    const resultado = await controller.validar({
      email: 'ana@empresa.com',
      senha: 'senai123',
    });

    expect(usuariosService.validar).toHaveBeenCalledWith(
      'ana@empresa.com',
      'senai123',
    );
    expect(resultado).toBe('Acesso Permitido');
  });

  it('validar deve retornar "Senha Incorreta" quando o service recusar', async () => {
    usuariosService.validar.mockResolvedValue('Senha Incorreta');

    const resultado = await controller.validar({
      email: 'ana@empresa.com',
      senha: 'errada',
    });

    expect(resultado).toBe('Senha Incorreta');
  });

  // Aula 35: Atividade Prática - "Auditoria LGPD" (Direito ao Esquecimento).
  it('remover deve delegar o ID ao service', async () => {
    usuariosService.remover.mockResolvedValue(undefined);

    await controller.remover('abc123');

    expect(usuariosService.remover).toHaveBeenCalledWith('abc123');
  });

  it('remover deve propagar NotFoundException para ID inexistente', async () => {
    usuariosService.remover.mockRejectedValue(
      new NotFoundException(
        'Usuário com ID 64f0000000000000000000ab não encontrado',
      ),
    );

    await expect(
      controller.remover('64f0000000000000000000ab'),
    ).rejects.toThrow(NotFoundException);
  });
});
