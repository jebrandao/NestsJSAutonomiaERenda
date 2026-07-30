import { Controller, Get, Headers, Res } from '@nestjs/common';
import type { Response } from 'express';

const CHAVE_API_ESPERADA = 'SENAI-2026';

@Controller()
export class SegurancaController {
  // GET /secreto
  @Get('secreto')
  acessarSecreto(@Headers('x-api-key') apiKey: string, @Res() res: Response) {
    if (apiKey !== CHAVE_API_ESPERADA) {
      res.status(403).json({ mensagem: 'Acesso negado: chave de API inválida ou ausente.' });
      return;
    }

    res.setHeader('x-auth-status', 'verificada');
    res.status(200).json({ mensagem: 'Conteúdo Secreto' });
  }
}
