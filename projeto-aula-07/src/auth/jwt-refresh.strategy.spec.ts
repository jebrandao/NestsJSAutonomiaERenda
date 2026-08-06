import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { UsuariosService } from '../usuarios/usuarios.service';

describe('JwtRefreshStrategy', () => {
  let strategy: JwtRefreshStrategy;
  let usuariosService: { buscarParaRefresh: jest.Mock };

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue('segredo-de-teste'),
    };
    usuariosService = { buscarParaRefresh: jest.fn() };
    strategy = new JwtRefreshStrategy(
      configService as never,
      usuariosService as unknown as UsuariosService,
    );
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  it('deve retornar { userId } quando o token bate com o hash salvo', async () => {
    const refreshToken = 'refresh.token.valido';
    const hash = await bcrypt.hash(refreshToken, await bcrypt.genSalt(4));
    usuariosService.buscarParaRefresh.mockResolvedValue({
      refreshTokenHash: hash,
    });

    const req = { body: { refresh_token: refreshToken } } as never;
    const resultado = await strategy.validate(req, { sub: 'abc123' });

    expect(usuariosService.buscarParaRefresh).toHaveBeenCalledWith('abc123');
    expect(resultado).toEqual({ userId: 'abc123' });
  });

  it('deve lançar UnauthorizedException quando o token não bate com o hash salvo', async () => {
    const hash = await bcrypt.hash(
      'outro-token-qualquer',
      await bcrypt.genSalt(4),
    );
    usuariosService.buscarParaRefresh.mockResolvedValue({
      refreshTokenHash: hash,
    });

    const req = { body: { refresh_token: 'token.adulterado' } } as never;

    await expect(strategy.validate(req, { sub: 'abc123' })).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('deve lançar UnauthorizedException quando o usuário não tem refreshTokenHash salvo (nunca logou ou já deu logout)', async () => {
    usuariosService.buscarParaRefresh.mockResolvedValue({
      refreshTokenHash: undefined,
    });

    const req = { body: { refresh_token: 'qualquer-token' } } as never;

    await expect(strategy.validate(req, { sub: 'abc123' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
