import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { Role } from './role.enum';

function criarContextoMock(user: { roles?: Role[] } | undefined) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => jest.fn(),
    getClass: () => jest.fn(),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('deve liberar quando a rota não tem @Roles() definido', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    const resultado = guard.canActivate(
      criarContextoMock({ roles: [Role.OPERADOR] }),
    );

    expect(resultado).toBe(true);
  });

  it('deve liberar quando o usuário tem um dos roles exigidos', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    const resultado = guard.canActivate(
      criarContextoMock({ roles: [Role.ADMIN] }),
    );

    expect(resultado).toBe(true);
  });

  it('deve bloquear quando o usuário não tem nenhum role exigido', () => {
    reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);

    const resultado = guard.canActivate(
      criarContextoMock({ roles: [Role.OPERADOR] }),
    );

    expect(resultado).toBe(false);
  });
});
