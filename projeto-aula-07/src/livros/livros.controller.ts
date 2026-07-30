import { Controller, Get, Param } from '@nestjs/common';
import { LivrosService } from './livros.service';

@Controller('livros')
export class LivrosController {
  constructor(private readonly livrosService: LivrosService) {}

  // GET /livros/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.livrosService.findOne(+id);
  }
}
