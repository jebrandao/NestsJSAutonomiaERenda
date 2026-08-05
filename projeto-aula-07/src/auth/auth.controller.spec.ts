import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = { login: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('login deve delegar email e senha ao service e retornar o access_token', async () => {
    authService.login.mockResolvedValue({
      access_token: 'token.assinado.aqui',
    });

    const resultado = await controller.login({
      email: 'ana@empresa.com',
      senha: 'senai123',
    });

    expect(authService.login).toHaveBeenCalledWith(
      'ana@empresa.com',
      'senai123',
    );
    expect(resultado).toEqual({ access_token: 'token.assinado.aqui' });
  });

  it('login deve propagar UnauthorizedException para credenciais inválidas', async () => {
    authService.login.mockRejectedValue(
      new UnauthorizedException('E-mail ou senha inválidos'),
    );

    await expect(
      controller.login({ email: 'ana@empresa.com', senha: 'errada' }),
    ).rejects.toThrow(UnauthorizedException);
  });
});
