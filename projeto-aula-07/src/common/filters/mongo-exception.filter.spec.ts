import { ArgumentsHost, HttpStatus, Logger } from '@nestjs/common';
import { Error as MongooseError } from 'mongoose';
import { MongoNetworkError, MongoServerError } from 'mongodb';
import { MongoExceptionFilter } from './mongo-exception.filter';

// Tipado como um objeto próprio (não Response do Express) para evitar o
// falso positivo do @typescript-eslint/unbound-method em
// expect(res.status)... adiante — a regra só dispara quando a propriedade
// vem de uma assinatura de método, não de uma propriedade de tipo função.
interface RespostaMock {
  status: jest.Mock;
  json: jest.Mock;
}

function criarResponseMock(): RespostaMock {
  const res = {} as RespostaMock;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

function criarHostMock(response: RespostaMock): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({}),
    }),
  } as unknown as ArgumentsHost;
}

describe('MongoExceptionFilter', () => {
  let filter: MongoExceptionFilter;

  beforeEach(() => {
    filter = new MongoExceptionFilter();
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('deve responder 409 com mensagem sanitizada para E11000 (chave duplicada)', () => {
    const res = criarResponseMock();
    const erro = new MongoServerError({
      message: 'E11000 duplicate key error...',
      code: 11000,
    });

    filter.catch(erro, criarHostMock(res));

    expect(res.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Conflito de Dados',
      message: 'O valor informado já está em uso.',
    });
  });

  it('deve responder 400 com mensagem sanitizada para CastError (ID mal formado)', () => {
    const res = criarResponseMock();
    const erro = new MongooseError.CastError('ObjectId', 'abc-123', 'id');

    filter.catch(erro, criarHostMock(res));

    expect(res.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Requisição Inválida',
      message: 'O formato do Identificador (ID) é inválido.',
    });
  });

  it('deve responder 422 juntando as mensagens de ValidationError', () => {
    const res = criarResponseMock();
    const erro = new MongooseError.ValidationError();
    erro.errors.preco = new MongooseError.ValidatorError({
      message: 'Preço deve ser maior ou igual a 0',
      path: 'preco',
    });

    filter.catch(erro, criarHostMock(res));

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Dados Inválidos',
      message: 'Preço deve ser maior ou igual a 0',
    });
  });

  it('deve responder 503 para falha de conexão com o banco', () => {
    const res = criarResponseMock();
    const erro = new MongoNetworkError('connection timed out');

    filter.catch(erro, criarHostMock(res));

    expect(res.status).toHaveBeenCalledWith(HttpStatus.SERVICE_UNAVAILABLE);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Serviço Indisponível',
      message:
        'Não foi possível completar a operação no momento. Tente novamente em instantes.',
    });
  });
});
