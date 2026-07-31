import { Controller, Get, Param } from '@nestjs/common';
import { ProdutosService } from './produtos.service';

@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  // GET /produtos/:id
  @Get(':id')
  buscarPorId(@Param('id') id: string) {
    return this.produtosService.findOne(id);
  }
}
