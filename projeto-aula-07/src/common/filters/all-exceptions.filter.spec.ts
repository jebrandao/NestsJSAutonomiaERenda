import {
  ArgumentsHost,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';
import { AllExceptionsFilter } from './all-exceptions.filter';

function criarResponseMock(): Response {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function criarHostMock(response: Response): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({}),
    }),
  } as unknown as ArgumentsHost;
}

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    errorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  // Aula 39: Atividade Prática - "O Inspetor de Falhas" (passo 3/4).
  it('deve responder 500 sanitizado e logar mensagem + stack trace para um erro inesperado (TypeError)', () => {
    const res = criarResponseMock();
    const erro = new TypeError(
      "Cannot read properties of null (reading 'nome')",
    );

    filter.catch(erro, criarHostMock(res));

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Erro Interno',
      message: 'Ocorreu um erro inesperado. Tente novamente mais tarde.',
    });
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining(erro.message),
      erro.stack,
    );
  });

  it('deve repassar uma HttpException (ex.: NotFoundException) com o status e corpo originais, sem tratar como 500', () => {
    const res = criarResponseMock();
    const erro = new NotFoundException('Produto com ID abc123 não encontrado');

    filter.catch(erro, criarHostMock(res));

    expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(res.json).toHaveBeenCalledWith(erro.getResponse());
  });

  it('deve lidar com um valor não-Error lançado (string/objeto solto)', () => {
    const res = criarResponseMock();

    filter.catch('algo deu errado', criarHostMock(res));

    expect(res.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    // Convertido para um Error sintético — ganha um stack próprio (não é undefined).
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('algo deu errado'),
      expect.any(String),
    );
  });
});
