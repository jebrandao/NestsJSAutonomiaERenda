import { Logger } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';
import { AuditoriaPerfilMiddleware } from './auditoria-perfil.middleware';

function criarRequestMock(userId: string): Request {
  return { params: { id: userId } } as unknown as Request;
}

describe('AuditoriaPerfilMiddleware', () => {
  let middleware: AuditoriaPerfilMiddleware;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new AuditoriaPerfilMiddleware();
    next = jest.fn();
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  it('should be defined', () => {
    expect(middleware).toBeDefined();
  });

  it('deve registrar o userId acessado e chamar next()', () => {
    const req = criarRequestMock('abc123');
    const res = {} as Response;
    const logSpy = jest.spyOn(Logger.prototype, 'log');

    middleware.use(req, res, next);

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('abc123'));
    expect(next).toHaveBeenCalled();
  });
});
