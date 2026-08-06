import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Role } from './role.enum';

describe('AuthService', () => {
  let service: AuthService;
  let usuariosService: { validarCredenciais: jest.Mock };
  let jwtService: { signAsync: jest.Mock };

  beforeEach(async () => {
    usuariosService = { validarCredenciais: jest.fn() };
    jwtService = { signAsync: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useValue: usuariosService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('login deve retornar access_token com payload sub/email/roles quando as credenciais são válidas', async () => {
    usuariosService.validarCredenciais.mockResolvedValue({
      _id: 'abc123',
      email: 'ana@empresa.com',
      roles: [Role.OPERADOR],
    });
    jwtService.signAsync.mockResolvedValue('token.assinado.aqui');

    const resultado = await service.login('ana@empresa.com', 'senai123');

    expect(usuariosService.validarCredenciais).toHaveBeenCalledWith(
      'ana@empresa.com',
      'senai123',
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'abc123',
      email: 'ana@empresa.com',
      roles: [Role.OPERADOR],
    });
    expect(resultado).toEqual({ access_token: 'token.assinado.aqui' });
  });

  it('login deve lançar UnauthorizedException quando as credenciais são inválidas', async () => {
    usuariosService.validarCredenciais.mockResolvedValue(null);

    await expect(service.login('ana@empresa.com', 'errada')).rejects.toThrow(
      new UnauthorizedException('E-mail ou senha inválidos'),
    );
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });
});
