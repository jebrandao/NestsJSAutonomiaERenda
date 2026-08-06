import { SetMetadata } from '@nestjs/common';
import { Role } from './role.enum';

export const ROLES_KEY = 'roles';

// Aula 32: torna a autorização declarativa e autodocumentada — quem lê
// @Roles(Role.ADMIN) num método já sabe quem pode acessar aquela rota, sem
// precisar abrir o RolesGuard para descobrir.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
