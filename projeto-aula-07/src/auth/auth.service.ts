import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { Role } from './role.enum';

const REFRESH_TOKEN_SALT_ROUNDS = 10;
const REFRESH_TOKEN_EXPIRES_IN = '7d';

interface UsuarioParaToken {
  _id: unknown;
  email: string;
  roles: Role[];
}

// Aula 30: Atividade Prática - "Fábrica de Tokens".
// Aula 33: Atividade Prática - "O Token Infinito (mas seguro)".
@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(
    email: string,
    senha: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const usuario = await this.usuariosService.validarCredenciais(email, senha);

    if (!usuario) {
      // Mensagem genérica de propósito: não revela se o e-mail existe ou
      // se foi a senha que errou (mesmo raciocínio de validarCredenciais).
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    const access_token = await this.gerarAccessToken(usuario);
    const refresh_token = await this.gerarRefreshToken(String(usuario._id));

    return { access_token, refresh_token };
  }

  // Aula 33: chamado pelo AuthController após o JwtRefreshAuthGuard já ter
  // validado a assinatura do Refresh Token E conferido o hash salvo no
  // banco — aqui só resta emitir um Access Token novo, sem pedir a senha de
  // novo. Por ora emite só um novo Access Token (o fluxo do slide marca a
  // rotação de Refresh Token como "opcional").
  async refresh(userId: string): Promise<{ access_token: string }> {
    const usuario = await this.usuariosService.buscarParaRefresh(userId);

    if (!usuario) {
      throw new UnauthorizedException();
    }

    return { access_token: await this.gerarAccessToken(usuario) };
  }

  private async gerarAccessToken(usuario: UsuarioParaToken): Promise<string> {
    // sub e email são as claims pedidas pelo slide (Aula 30); roles entrou
    // na Aula 32 — é o que o RolesGuard lê em request.user para autorização.
    // Nada de dados sensíveis no payload — ele é apenas codificado em
    // Base64, não criptografado.
    const payload = {
      sub: String(usuario._id),
      email: usuario.email,
      roles: usuario.roles,
    };
    return this.jwtService.signAsync(payload);
  }

  // Assinado com JWT_REFRESH_SECRET (não JWT_SECRET): um Access Token
  // roubado não pode ser reaproveitado como Refresh Token, e vice-versa —
  // chaves diferentes, estratégias diferentes (ver jwt-refresh.strategy.ts).
  // Vida longa (7 dias) porque, ao contrário do Access Token, este token
  // não autentica requisições — só autoriza a emissão de um novo Access
  // Token, então pode durar mais sem aumentar a superfície de ataque do
  // mesmo jeito.
  private async gerarRefreshToken(userId: string): Promise<string> {
    const refreshToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      },
    );

    // Mesmo raciocínio da senha (Aula 26): nunca o token puro no banco,
    // só o hash. Se o banco vazar, o atacante não tem um token utilizável.
    const salt = await bcrypt.genSalt(REFRESH_TOKEN_SALT_ROUNDS);
    const hash = await bcrypt.hash(refreshToken, salt);
    await this.usuariosService.salvarRefreshTokenHash(userId, hash);

    return refreshToken;
  }
}
