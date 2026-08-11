import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

// Aula 39: Atividade Prática - "O Inspetor de Falhas" (passo 3).
// Rede de segurança final: qualquer exceção que nenhum filtro mais
// específico capturou (MongoExceptionFilter cobre só erros de banco) cai
// aqui. @Catch() sem argumentos intercepta literalmente qualquer coisa.
//
// GOTCHA real: a ordem de registro em app.useGlobalFilters() é
// CONTRAINTUITIVA — o Nest inverte a lista internamente antes de testar
// (RouterExceptionFilters.create → filters.reverse(), @nestjs/core), então
// o ÚLTIMO argumento passado é o PRIMEIRO a ser tentado. Por isso este
// filtro (que bate com tudo) precisa ser passado PRIMEIRO para
// useGlobalFilters() — assim ele acaba sendo tentado por ÚLTIMO de
// verdade, depois do MongoExceptionFilter. Registrar na ordem "intuitiva"
// (Mongo primeiro, catch-all depois) faz o catch-all vencer sempre,
// inclusive para CastError/E11000 — foi exatamente o bug reproduzido e
// corrigido nesta aula (ver main.ts).
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();

    // HttpException (BadRequestException, NotFoundException, Unauthorized
    // etc.) já é uma resposta de negócio tratada de propósito em algum
    // service/guard — não é um "erro 500 inesperado", só repassa como está.
    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(exception.getResponse());
    }

    const erro =
      exception instanceof Error ? exception : new Error(String(exception));

    // Aqui sim: um erro genuinamente inesperado — TypeError, acesso a
    // propriedade de null, etc. Mensagem e stack trace completos vão só
    // para o log do servidor, nunca para o cliente (mesmo raciocínio do
    // MongoExceptionFilter).
    this.logger.error(`Erro não tratado: ${erro.message}`, erro.stack);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      error: 'Erro Interno',
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    });
  }
}
