import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LivrosService } from './livros.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Guard adicionado: rota nunca teve autenticação (Aula 09, anterior ao
// sistema de JWT). Nivelado com o padrão do ProdutosController.
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('livros')
@ApiResponse({
  status: 401,
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('livros')
export class LivrosController {
  constructor(private readonly livrosService: LivrosService) {}

  // GET /livros/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.livrosService.findOne(+id);
  }
}
