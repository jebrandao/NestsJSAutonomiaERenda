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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ValidarUsuarioDto } from './dto/validar-usuario.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // POST /usuarios
  @Post()
  @ApiOperation({
    summary: 'Cria um novo usuário (senha criptografada via hook pre-save)',
  })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso.' })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos para o Schema do MongoDB.',
  })
  @ApiResponse({
    status: 409,
    description: 'Já existe um usuário com este e-mail.',
  })
  criar(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.create(createUsuarioDto);
  }

  // GET /usuarios
  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários (sem o campo senha)' })
  @ApiResponse({ status: 200, description: 'Lista de usuários.' })
  findAll() {
    return this.usuariosService.findAll();
  }

  // GET /usuarios/:id
  @Get(':id')
  @ApiOperation({ summary: 'Busca um usuário pelo ID (sem o campo senha)' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado.' })
  @ApiResponse({ status: 400, description: 'ID em formato inválido.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  buscarPorId(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  // PATCH /usuarios/:id
  @Patch(':id')
  @ApiOperation({
    summary:
      'Atualiza parcialmente um usuário (recriptografa a senha só se ela mudar)',
  })
  @ApiResponse({ status: 200, description: 'Usuário atualizado com sucesso.' })
  @ApiResponse({ status: 400, description: 'ID ou dados inválidos.' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  @ApiResponse({
    status: 409,
    description: 'Já existe um usuário com este e-mail.',
  })
  atualizar(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  // POST /usuarios/validar
  @Post('validar')
  @ApiOperation({
    summary: 'Valida e-mail e senha via bcrypt.compare() (login)',
  })
  @ApiResponse({
    status: 201,
    description: '"Acesso Permitido" ou "Senha Incorreta".',
  })
  validar(@Body() validarUsuarioDto: ValidarUsuarioDto) {
    return this.usuariosService.validar(
      validarUsuarioDto.email,
      validarUsuarioDto.senha,
    );
  }

  // DELETE /usuarios/:id
  // Aula 35: Atividade Prática - "Auditoria LGPD" (Direito ao Esquecimento).
  // Autenticada (JwtAuthGuard) porque o slide é explícito: "endpoint
  // dedicado recebe a requisição de exclusão autenticada do titular".
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Exclui a conta (soft-delete com anonimização de nome/e-mail)',
  })
  @ApiResponse({ status: 204, description: 'Conta anonimizada com sucesso.' })
  @ApiResponse({ status: 400, description: 'ID em formato inválido.' })
  @ApiResponse({
    status: 401,
    description: 'Token ausente, inválido ou expirado.',
  })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado.' })
  async remover(@Param('id') id: string) {
    await this.usuariosService.remover(id);
  }
}
