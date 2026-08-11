import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { ConnectionStates, type Connection } from 'mongoose';
import { readFileSync } from 'fs';
import { join } from 'path';

const { version } = JSON.parse(
  readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf-8'),
) as {
  version: string;
};

// Aula 38: Atividade Prática - "O Arquiteto de Infraestrutura" (passo 3).
// Rota pública (sem guard — plataformas de Cloud como Render/Railway batem
// aqui sem token) usada como Health Check pelo painel de monitoramento:
// confirma que o processo subiu E que ele consegue falar com o MongoDB,
// não só que o Node.js está de pé.
@ApiTags('status')
@Controller('status')
export class StatusController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  @ApiOperation({
    summary: 'Health Check — usado por plataformas de Cloud para monitoramento',
  })
  @ApiResponse({
    status: 200,
    description: 'Servidor no ar (independente do estado do banco).',
  })
  verificar() {
    // readyState do Mongoose: disconnected, connected, connecting, disconnecting.
    const bancoConectado =
      this.connection.readyState === ConnectionStates.connected;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: bancoConectado ? 'connected' : 'disconnected',
      version,
    };
  }
}
