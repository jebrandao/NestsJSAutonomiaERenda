import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';

interface RequisicaoComRefreshUser extends Request {
  user: { userId: string };
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login
  @Post('login')
  @ApiOperation({
    summary: 'Autentica um usuário e emite Access Token + Refresh Token',
  })
  @ApiResponse({
    status: 201,
    description: '{ access_token: string, refresh_token: string }',
  })
  @ApiResponse({ status: 401, description: 'E-mail ou senha inválidos.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.senha);
  }

  // POST /auth/refresh
  // Aula 33: Atividade Prática - "O Token Infinito (mas seguro)".
  // O JwtRefreshAuthGuard faz todo o trabalho de validação (assinatura +
  // hash no banco, via JwtRefreshStrategy) antes deste método rodar — aqui
  // só emitimos o novo Access Token para o usuário já confirmado.
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh')
  @ApiOperation({
    summary: 'Emite um novo Access Token a partir de um Refresh Token válido',
  })
  @ApiBody({ schema: { properties: { refresh_token: { type: 'string' } } } })
  @ApiResponse({ status: 201, description: '{ access_token: string }' })
  @ApiResponse({
    status: 401,
    description: 'Refresh Token ausente, expirado, inválido ou revogado.',
  })
  refresh(@Req() req: RequisicaoComRefreshUser) {
    return this.authService.refresh(req.user.userId);
  }
}
