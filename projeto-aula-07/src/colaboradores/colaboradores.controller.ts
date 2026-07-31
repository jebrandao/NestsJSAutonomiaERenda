import { Body, Controller, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { colaboradorSchema } from './schemas/colaborador.schema';
import type { CreateColaboradorDto } from './schemas/colaborador.schema';

@Controller('colaboradores')
export class ColaboradoresController {
  // POST /colaboradores
  @Post()
  @UsePipes(new ZodValidationPipe(colaboradorSchema))
  create(@Body() colaborador: CreateColaboradorDto) {
    return {
      mensagem: `Colaborador ${colaborador.nome} cadastrado com sucesso!`,
      dados: colaborador,
    };
  }
}
