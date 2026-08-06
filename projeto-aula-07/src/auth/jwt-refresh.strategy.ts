import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';

interface RefreshJwtPayload {
  sub: string;
}

// Aula 33: Atividade Prática - "O Token Infinito (mas seguro)".
// Strategy dedicada, separada da JwtStrategy do Access Token: usa uma
// secret diferente (JWT_REFRESH_SECRET) e, além de verificar a assinatura,
// confere se o token bate com o hash salvo no banco — sem isso, um Refresh
// Token válido mas já revogado (logout, sessão apagada por um admin)
// continuaria funcionando para sempre.
// 'jwt-refresh' é o nome da estratégia — precisa ser diferente de 'jwt'
// (Aula 31) para o Passport não confundir as duas ao registrar.
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    configService: ConfigService,
    private readonly usuariosService: UsuariosService,
  ) {
    super({
      // O corpo da requisição carrega o token (refresh_token), não o header
      // Authorization — o Access Token expirado que ainda estiver lá é
      // irrelevante para esta rota.
      jwtFromRequest: ExtractJwt.fromBodyField('refresh_token'),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_REFRESH_SECRET') ?? '',
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: RefreshJwtPayload,
  ): Promise<{ userId: string }> {
    const refreshToken = (req.body as { refresh_token?: string } | undefined)
      ?.refresh_token;
    const usuario = await this.usuariosService.buscarParaRefresh(payload.sub);

    if (!refreshToken || !usuario?.refreshTokenHash) {
      throw new UnauthorizedException();
    }

    const hashValido = await bcrypt.compare(
      refreshToken,
      usuario.refreshTokenHash,
    );
    if (!hashValido) {
      throw new UnauthorizedException();
    }

    return { userId: payload.sub };
  }
}
