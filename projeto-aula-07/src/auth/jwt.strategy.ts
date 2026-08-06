import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role } from './role.enum';

interface JwtPayload {
  sub: string;
  email: string;
  roles: Role[];
}

// Aula 32: formato de req.user depois que a JwtStrategy valida o token —
// usado pelo RolesGuard para comparar os papéis do usuário com os exigidos
// pela rota.
export interface UsuarioAutenticado {
  userId: string;
  email: string;
  roles: Role[];
}

// Aula 31: Atividade Prática - "Acesso Restrito ao Inventário".
// Configura como o Passport extrai e valida o token: lê o Bearer Token do
// header Authorization e usa a mesma JWT_SECRET do login (Aula 30) para
// verificar a assinatura e checar a expiração automaticamente.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
    });
  }

  // Só é chamado depois que a assinatura e o exp já foram verificados pelo
  // Passport. O que este método retorna vira req.user nos controllers.
  // Aula 32: roles do payload passam adiante — sem elas o RolesGuard não
  // teria como saber quem pode acessar rotas restritas a admin.
  validate(payload: JwtPayload): UsuarioAutenticado {
    return { userId: payload.sub, email: payload.email, roles: payload.roles };
  }
}
