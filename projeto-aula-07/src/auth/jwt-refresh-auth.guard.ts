import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Aula 33: ativa a JwtRefreshStrategy ('jwt-refresh') — mesmo papel do
// JwtAuthGuard (Aula 31), mas para a estratégia de Refresh Token.
@Injectable()
export class JwtRefreshAuthGuard extends AuthGuard('jwt-refresh') {}
