import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CategoriasService } from './categorias.service';
import { CreateCategoriaDto } from './dto/create-categoria.dto';

@ApiTags('categorias')
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
