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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ConvidadosService } from './convidados.service';
import { CreateConvidadoDto } from './dto/create-convidado.dto';
import { UpdateConvidadoDto } from './dto/update-convidado.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Guard adicionado: rota nunca teve autenticação (Aula 08, anterior ao
// sistema de JWT). Nivelado com o padrão do ProdutosController.
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('convidados')
@ApiResponse({
  status: 401,
  description: 'Token ausente, inválido ou expirado.',
})
@Controller('convidados')
export class ConvidadosController {
  constructor(private readonly convidadosService: ConvidadosService) {}

  // GET /convidados
  @Get()
  listarTodos() {
    return this.convidadosService.findAll();
  }

  // POST /convidados
  @Post()
  criar(@Body() createConvidadoDto: CreateConvidadoDto) {
    console.log('Convidado recebido:', createConvidadoDto.nome);
    const convidado = this.convidadosService.create(createConvidadoDto);
    return {
      mensagem: `Convidado ${convidado.nome} confirmado com sucesso!`,
      dados: convidado,
    };
  }

  // PATCH /convidados/:id - altera apenas a idade do convidado indicado.
  @Patch(':id')
  atualizarIdade(
    @Param('id') id: string,
    @Body() updateConvidadoDto: UpdateConvidadoDto,
  ) {
    console.log(`Atualizando idade do convidado com ID: ${id}`);
    return this.convidadosService.updateIdade(+id, updateConvidadoDto);
  }

  // DELETE /convidados/:id
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remover(@Param('id') id: string) {
    console.log(`Removendo convidado com ID: ${id}`);
    this.convidadosService.remove(+id);
  }
}
