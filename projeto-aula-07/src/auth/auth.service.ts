import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';

// Aula 30: Atividade Prática - "Fábrica de Tokens".
@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, senha: string): Promise<{ access_token: string }> {
    const usuario = await this.usuariosService.validarCredenciais(email, senha);

    if (!usuario) {
      // Mensagem genérica de propósito: não revela se o e-mail existe ou
      // se foi a senha que errou (mesmo raciocínio de validarCredenciais).
      throw new UnauthorizedException('E-mail ou senha inválidos');
    }

    // sub e email são as claims pedidas pelo slide (Aula 30); roles entrou
    // na Aula 32 — é o que o RolesGuard lê em request.user para autorização.
    // Nada de dados sensíveis no payload — ele é apenas codificado em
    // Base64, não criptografado.
    const payload = {
      sub: String(usuario._id),
      email: usuario.email,
      roles: usuario.roles,
    };

    return { access_token: await this.jwtService.signAsync(payload) };
  }
}
