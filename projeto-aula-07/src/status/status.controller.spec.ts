import { Test, TestingModule } from '@nestjs/testing';
import { getConnectionToken } from '@nestjs/mongoose';
import { StatusController } from './status.controller';

describe('StatusController', () => {
  let controller: StatusController;
  let connection: { readyState: number };

  beforeEach(async () => {
    connection = { readyState: 1 };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatusController],
      providers: [{ provide: getConnectionToken(), useValue: connection }],
    }).compile();

    controller = module.get<StatusController>(StatusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('deve reportar database "connected" quando readyState é 1', () => {
    connection.readyState = 1;

    const resultado = controller.verificar();

    expect(resultado.status).toBe('ok');
    expect(resultado.database).toBe('connected');
    expect(resultado.version).toEqual(expect.any(String));
    expect(new Date(resultado.timestamp).toString()).not.toBe('Invalid Date');
  });

  it('deve reportar database "disconnected" quando readyState não é 1', () => {
    connection.readyState = 0;

    const resultado = controller.verificar();

    // Aula 38: o servidor responde 200 mesmo com o banco fora do ar — quem
    // decide o que fazer com essa informação é o painel de monitoramento
    // da Cloud, não este endpoint.
    expect(resultado.status).toBe('ok');
    expect(resultado.database).toBe('disconnected');
  });
});
