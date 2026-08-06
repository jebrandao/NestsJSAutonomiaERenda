import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from './role.enum';
import { ROLES_KEY } from './roles.decorator';
import type { UsuarioAutenticado } from './jwt.strategy';

// Aula 32: Atividade Prática - "Sistema de Controle de Fábrica".
// Roda depois do JwtAuthGuard (que já preencheu request.user) — este guard
// só decide SE aquele usuário identificado tem o papel certo, não QUEM ele é.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // getAllAndOverride: o @Roles() do método tem prioridade sobre o da
    // classe, se algum dia coexistirem os dois.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Rota sem @Roles(): não exige papel específico, só estar autenticado
    // (o JwtAuthGuard já cuidou disso).
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: UsuarioAutenticado }>();
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
