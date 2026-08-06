import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Role } from './role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usuariosService: {
    validarCredenciais: jest.Mock;
    buscarParaRefresh: jest.Mock;
    salvarRefreshTokenHash: jest.Mock;
  };
  let jwtService: { signAsync: jest.Mock };
  let configService: { get: jest.Mock };

  beforeEach(async () => {
    usuariosService = {
      validarCredenciais: jest.fn(),
      buscarParaRefresh: jest.fn(),
      salvarRefreshTokenHash: jest.fn(),
    };
    jwtService = { signAsync: jest.fn() };
    configService = { get: jest.fn().mockReturnValue('segredo-do-refresh') };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuariosService },
        { provide: JwtService, useValue: jwtService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('deve retornar access_token e refresh_token quando as credenciais são válidas', async () => {
      usuariosService.validarCredenciais.mockResolvedValue({
        _id: 'abc123',
        email: 'ana@empresa.com',
        roles: [Role.OPERADOR],
      });
      jwtService.signAsync
        .mockResolvedValueOnce('access.token.aqui')
        .mockResolvedValueOnce('refresh.token.aqui');

      const resultado = await service.login('ana@empresa.com', 'senai123');

      expect(usuariosService.validarCredenciais).toHaveBeenCalledWith(
        'ana@empresa.com',
        'senai123',
      );
      // 1ª chamada: Access Token, payload sub/email/roles, sem opções extras (usa o JwtModule global).
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(1, {
        sub: 'abc123',
        email: 'ana@empresa.com',
        roles: [Role.OPERADOR],
      });
      // 2ª chamada: Refresh Token, payload só com sub, assinado com JWT_REFRESH_SECRET e validade de 7 dias.
      expect(jwtService.signAsync).toHaveBeenNthCalledWith(
        2,
        { sub: 'abc123' },
        { secret: 'segredo-do-refresh', expiresIn: '7d' },
      );
      // O Refresh Token puro nunca é salvo — só o hash dele.
      expect(usuariosService.salvarRefreshTokenHash).toHaveBeenCalledWith(
        'abc123',
        expect.any(String),
      );
      const [, hashSalvo] = usuariosService.salvarRefreshTokenHash.mock
        .calls[0] as [string, string];
      expect(hashSalvo).not.toBe('refresh.token.aqui');
      expect(resultado).toEqual({
        access_token: 'access.token.aqui',
        refresh_token: 'refresh.token.aqui',
      });
    });

    it('deve lançar UnauthorizedException quando as credenciais são inválidas', async () => {
      usuariosService.validarCredenciais.mockResolvedValue(null);

      await expect(service.login('ana@empresa.com', 'errada')).rejects.toThrow(
        new UnauthorizedException('E-mail ou senha inválidos'),
      );
      expect(jwtService.signAsync).not.toHaveBeenCalled();
    });
  });

  // Aula 33: Atividade Prática - "O Token Infinito (mas seguro)".
  describe('refresh', () => {
    it('deve emitir um novo access_token para um usuário existente', async () => {
      usuariosService.buscarParaRefresh.mockResolvedValue({
        _id: 'abc123',
        email: 'ana@empresa.com',
        roles: [Role.OPERADOR],
      });
      jwtService.signAsync.mockResolvedValue('novo.access.token');

      const resultado = await service.refresh('abc123');

      expect(usuariosService.buscarParaRefresh).toHaveBeenCalledWith('abc123');
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: 'abc123',
        email: 'ana@empresa.com',
        roles: [Role.OPERADOR],
      });
      expect(resultado).toEqual({ access_token: 'novo.access.token' });
    });

    it('deve lançar UnauthorizedException quando o usuário do token não existe mais', async () => {
      usuariosService.buscarParaRefresh.mockResolvedValue(null);

      await expect(service.refresh('inexistente')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
