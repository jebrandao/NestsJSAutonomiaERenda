import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';
import { Error as MongooseError } from 'mongoose';
import { MongoNetworkError, MongoServerError } from 'mongodb';

// Aula 27: Atividade Prática - "O Escudo de Dados".
// Filtro global: substitui os try/catch espalhados pelos services para
// erros de infraestrutura (CastError, E11000, ValidationError, falha de
// conexão) por um único ponto de tradução — erro técnico bruto entra,
// mensagem de negócio sai, sem vazar detalhes internos do MongoDB.
@Catch(
  MongoServerError,
  MongooseError.CastError,
  MongooseError.ValidationError,
  MongoNetworkError,
  MongooseError.MongooseServerSelectionError,
)
export class MongoExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(MongoExceptionFilter.name);

  catch(
    exception:
      | MongoServerError
      | MongooseError.CastError
      | MongooseError.ValidationError
      | MongoNetworkError
      | MongooseError.MongooseServerSelectionError,
    host: ArgumentsHost,
  ) {
    const response = host.switchToHttp().getResponse<Response>();

    // O stack trace completo fica só no log do servidor — nunca no JSON
    // devolvido ao cliente.
    this.logger.error(`Erro no banco: ${exception.message}`, exception.stack);

    if (exception instanceof MongoServerError && exception.code === 11000) {
      return response.status(HttpStatus.CONFLICT).json({
        error: 'Conflito de Dados',
        message: 'O valor informado já está em uso.',
      });
    }

    if (exception instanceof MongooseError.CastError) {
      return response.status(HttpStatus.BAD_REQUEST).json({
        error: 'Requisição Inválida',
        message: 'O formato do Identificador (ID) é inválido.',
      });
    }

    if (exception instanceof MongooseError.ValidationError) {
      const mensagens = Object.values(exception.errors).map(
        (erro) => erro.message,
      );
      return response.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        error: 'Dados Inválidos',
        message: mensagens.join(', '),
      });
    }

    // MongoNetworkError / MongooseServerSelectionError: banco offline,
    // credenciais inválidas ou timeout de rede.
    return response.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      error: 'Serviço Indisponível',
      message:
        'Não foi possível completar a operação no momento. Tente novamente em instantes.',
    });
  }
}
