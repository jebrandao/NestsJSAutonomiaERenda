import type { Request, Response, NextFunction } from 'express';
import { LoggerMiddleware } from './logger.middleware';

function criarRequestMock(path: string, headers: Record<string, string> = {}): Request {
  return { method: 'GET', originalUrl: path, path, headers } as unknown as Request;
}

// Tipado como um objeto próprio (não Response): status/json aqui são
// propriedades de tipo função (jest.Mock), não assinaturas de método —
// é isso que evita o falso positivo do @typescript-eslint/unbound-method
// ao fazer expect(res.status)... adiante (a regra só dispara quando a
// propriedade vem de um método tipado com possível dependência de `this`).
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

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new LoggerMiddleware();
    next = jest.fn();
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('deve chamar next() normalmente para uma rota comum', () => {
    const req = criarRequestMock('/convidados');
    const res = criarResponseMock();

    middleware.use(req, res as unknown as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('deve bloquear /admin sem o header x-user-role com 403', () => {
    const req = criarRequestMock('/admin');
    const res = criarResponseMock();

    middleware.use(req, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'Acesso Negado' });
    expect(next).not.toHaveBeenCalled();
  });

  it('deve bloquear /admin com um cargo diferente de supervisor', () => {
    const req = criarRequestMock('/admin', { 'x-user-role': 'estagiario' });
    const res = criarResponseMock();

    middleware.use(req, res as unknown as Response, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('deve liberar /admin quando x-user-role é supervisor', () => {
    const req = criarRequestMock('/admin', { 'x-user-role': 'supervisor' });
    const res = criarResponseMock();

    middleware.use(req, res as unknown as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});
