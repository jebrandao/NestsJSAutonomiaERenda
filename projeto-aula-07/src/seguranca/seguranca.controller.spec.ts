import { Test, TestingModule } from '@nestjs/testing';
import type { Response } from 'express';
import { SegurancaController } from './seguranca.controller';

// Tipado como um objeto próprio (não Response) para evitar o falso positivo
// do @typescript-eslint/unbound-method em expect(res.status)... adiante —
// ver o mesmo padrão em logger.middleware.spec.ts.
interface RespostaMock {
  status: jest.Mock;
  json: jest.Mock;
  setHeader: jest.Mock;
}

function criarResponseMock(): RespostaMock {
  const res = {} as RespostaMock;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
}

describe('SegurancaController', () => {
  let controller: SegurancaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SegurancaController],
    }).compile();

    controller = module.get<SegurancaController>(SegurancaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve retornar 403 quando a chave de API está ausente ou incorreta', () => {
    const res = criarResponseMock();

    controller.acessarSecreto('chave-errada', res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      mensagem: 'Acesso negado: chave de API inválida ou ausente.',
    });
    expect(res.setHeader).not.toHaveBeenCalled();
  });

  it('deve retornar 200 com o header x-auth-status quando a chave é correta', () => {
    const res = criarResponseMock();

    controller.acessarSecreto('SENAI-2026', res as unknown as Response);

    expect(res.setHeader).toHaveBeenCalledWith('x-auth-status', 'verificada');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ mensagem: 'Conteúdo Secreto' });
  });
});
