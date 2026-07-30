import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConvidadosService } from './convidados.service';

describe('ConvidadosService', () => {
  let service: ConvidadosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConvidadosService],
    }).compile();

    service = module.get<ConvidadosService>(ConvidadosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll deve retornar os 3 convidados iniciais', () => {
    expect(service.findAll()).toHaveLength(3);
  });

  it('create deve adicionar um novo convidado com ID gerado', () => {
    const novo = service.create({ nome: 'Duda', idade: 28 });
    expect(novo).toEqual({ id: 4, nome: 'Duda', idade: 28 });
    expect(service.findAll()).toHaveLength(4);
  });

  it('updateIdade deve alterar apenas a idade do convidado indicado', () => {
    const atualizado = service.updateIdade(1, { idade: 99 });
    expect(atualizado).toEqual({ id: 1, nome: 'Ana', idade: 99 });
  });

  it('remove deve excluir o convidado da lista', () => {
    service.remove(2);
    expect(service.findAll().find((c) => c.id === 2)).toBeUndefined();
  });

  it('findOne deve lançar NotFoundException para ID inexistente', () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException);
  });
});
