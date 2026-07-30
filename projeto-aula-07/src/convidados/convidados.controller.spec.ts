import { Test, TestingModule } from '@nestjs/testing';
import { ConvidadosController } from './convidados.controller';
import { ConvidadosService } from './convidados.service';

describe('ConvidadosController', () => {
  let controller: ConvidadosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConvidadosController],
      providers: [ConvidadosService],
    }).compile();

    controller = module.get<ConvidadosController>(ConvidadosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('listarTodos deve retornar os convidados padrão', () => {
    expect(controller.listarTodos()).toEqual([
      { id: 1, nome: 'Ana', idade: 28 },
      { id: 2, nome: 'Bruno', idade: 34 },
      { id: 3, nome: 'Carlos', idade: 22 },
    ]);
  });

  it('criar deve logar e confirmar o convidado recebido', () => {
    const resultado = controller.criar({ nome: 'Duda', idade: 28 });
    expect(resultado.mensagem).toBe('Convidado Duda confirmado com sucesso!');
    expect(resultado.dados).toEqual({ id: 4, nome: 'Duda', idade: 28 });
  });

  it('atualizarIdade deve alterar apenas a idade do convidado indicado', () => {
    const resultado = controller.atualizarIdade('1', { idade: 40 });
    expect(resultado).toEqual({ id: 1, nome: 'Ana', idade: 40 });
  });

  it('remover deve excluir o convidado sem retornar corpo', () => {
    const resultado = controller.remover('3');
    expect(resultado).toBeUndefined();
    expect(controller.listarTodos().find((c) => c.id === 3)).toBeUndefined();
  });
});
