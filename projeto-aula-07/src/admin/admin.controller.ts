import { Controller, Get } from '@nestjs/common';

@Controller('admin')
export class AdminController {
  // GET /admin - só é alcançada se o LoggerMiddleware liberar a requisição.
  @Get()
  painel() {
    return { mensagem: 'Bem-vindo ao painel administrativo.' };
  }
}
