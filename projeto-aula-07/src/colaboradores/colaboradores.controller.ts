import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { colaboradorSchema } from './schemas/colaborador.schema';
import type { CreateColaboradorDto } from './schemas/colaborador.schema';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

// Guard adicionado: cadastro de colaborador estava aberto para qualquer um,
// sem token. Rota nunca teve autenticação (Aula 16, anterior ao JWT).
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('colaboradores')
@ApiResponse({
  status: 401,
  description: 'Token ausente, inválido ou expirado.',
})
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
