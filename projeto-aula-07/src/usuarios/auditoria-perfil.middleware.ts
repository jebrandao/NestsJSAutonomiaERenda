import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

// Aula 35: Atividade Prática - "Auditoria LGPD".
// Registra quem acessou o perfil de qual usuário e quando — a base de
// qualquer trilha de auditoria exigida pela LGPD em caso de investigação
// de vazamento. Aplicado só em GET /usuarios/:id (ver app.module.ts), não
// em toda a aplicação como o LoggerMiddleware genérico da Aula 13.
@Injectable()
export class AuditoriaPerfilMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuditoriaPerfilMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(
      `Perfil acessado — userId: ${String(req.params.id)}, timestamp: ${new Date().toISOString()}`,
    );

    next();
  }
}
