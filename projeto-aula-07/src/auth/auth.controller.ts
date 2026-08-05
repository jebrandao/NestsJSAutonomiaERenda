import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // POST /auth/login
  @Post('login')
  @ApiOperation({ summary: 'Autentica um usuário e emite um JWT' })
  @ApiResponse({ status: 201, description: '{ access_token: string }' })
  @ApiResponse({ status: 401, description: 'E-mail ou senha inválidos.' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.senha);
  }
}
