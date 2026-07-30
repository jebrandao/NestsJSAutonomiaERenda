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
} from '@nestjs/common';
import { ConvidadosService } from './convidados.service';
import { CreateConvidadoDto } from './dto/create-convidado.dto';
import { UpdateConvidadoDto } from './dto/update-convidado.dto';

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
  atualizarIdade(@Param('id') id: string, @Body() updateConvidadoDto: UpdateConvidadoDto) {
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
