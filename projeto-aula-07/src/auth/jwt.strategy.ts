import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

interface JwtPayload {
  sub: string;
  email: string;
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
  validate(payload: JwtPayload) {
    return { userId: payload.sub, email: payload.email };
  }
}
