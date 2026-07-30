import { Test, TestingModule } from '@nestjs/testing';
import { ConvidadosController } from './convidados.controller';

describe('ConvidadosController', () => {
  let controller: ConvidadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConvidadosController],
    }).compile();

    controller = module.get<ConvidadosController>(ConvidadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('listarTodos deve retornar os convidados padrão', () => {
    expect(controller.listarTodos()).toEqual(['Ana', 'Bruno', 'Carlos']);
  });

  it('criar deve logar e confirmar o convidado recebido', () => {
    const resultado = controller.criar({ nome: 'Duda', idade: 28 });
    expect(resultado.mensagem).toBe('Convidado Duda confirmado com sucesso!');
    expect(resultado.dados).toEqual({ nome: 'Duda', idade: 28 });
  });
});
