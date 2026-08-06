import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { FiltrosProdutoDto } from './dto/filtros-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '../auth/role.enum';

// Aula 31: Atividade Prática - "Acesso Restrito ao Inventário".
// @UseGuards no topo da classe protege todos os endpoints de uma só vez —
// nenhuma rota de /produtos responde sem um Bearer Token válido.
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('produtos')
@ApiResponse({
  status: 401,
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  // POST /produtos
  @Post()
  @ApiOperation({ summary: 'Cria um novo produto' })
  @ApiResponse({ status: 201, description: 'Produto criado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos para o Schema do MongoDB.',
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe um produto com este nome.',
  })
  criar(@Body() createProdutoDto: CreateProdutoDto) {
    return this.produtosService.create(createProdutoDto);
  }

  // GET /produtos?categoria=EPI&ordenar=preco_asc&pagina=2
  @Get()
  @ApiOperation({
    summary: 'Lista produtos com filtro, ordenação e paginação (5 por página)',
  })
  @ApiQuery({
    name: 'categoria',
    required: false,
    description: 'ObjectId de uma Categoria',
  })
  @ApiQuery({
    name: 'ordenar',
    required: false,
    enum: ['preco_asc', 'preco_desc'],
  })
  @ApiQuery({ name: 'pagina', required: false, example: '1' })
  @ApiResponse({ status: 200, description: 'Lista de produtos (até 5 itens).' })
  findAll(@Query() filtros: FiltrosProdutoDto) {
    return this.produtosService.findAll(filtros);
  }

  // GET /produtos/:id
  @Get(':id')
  @ApiOperation({ summary: 'Busca um produto pelo ID' })
  @ApiResponse({ status: 200, description: 'Produto encontrado.' })
  @ApiResponse({ status: 400, description: 'ID em formato inválido.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  buscarPorId(@Param('id') id: string) {
    return this.produtosService.findOne(id);
  }

  // PATCH /produtos/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza parcialmente um produto existente' })
  @ApiResponse({ status: 200, description: 'Produto atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'ID ou dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'Já existe um produto com este nome.',
  })
  atualizar(
    @Param('id') id: string,
    @Body() updateProdutoDto: UpdateProdutoDto,
  ) {
    return this.produtosService.update(id, updateProdutoDto);
  }

  // DELETE /produtos/:id
  // Aula 32: Atividade Prática - "Sistema de Controle de Fábrica".
  // RolesGuard roda depois do JwtAuthGuard da classe (já garantido) e exige
  // Role.ADMIN — um operador autenticado recebe 403, não 401.
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove um produto (somente admin, e só com estoque zerado)',
  })
  @ApiResponse({ status: 204, description: 'Produto removido com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'ID inválido ou produto ainda possui itens em estoque.',
  })
  @ApiResponse({
    status: 403,
    description: 'Usuário autenticado, mas sem o papel admin.',
  })
  @ApiResponse({ status: 404, description: 'Produto não encontrado.' })
  async remover(@Param('id') id: string) {
    await this.produtosService.delete(id);
  }
}
