import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Guard adicionado: categorias alimentam produtos.categoria (protegido
// desde a Aula 31) mas ficaram sem autenticação própria até agora.
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('categorias')
@ApiResponse({
  status: 401,
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  // POST /categorias
  @Post()
  @ApiOperation({ summary: 'Cria uma nova categoria' })
  @ApiResponse({ status: 201, description: 'Categoria criada com sucesso.' })
  criar(@Body() createCategoriaDto: CreateCategoriaDto) {
    return this.categoriasService.create(createCategoriaDto);
  }

  // GET /categorias
  @Get()
  @ApiOperation({ summary: 'Lista todas as categorias' })
  @ApiResponse({ status: 200, description: 'Lista de categorias.' })
  findAll() {
    return this.categoriasService.findAll();
  }
}
