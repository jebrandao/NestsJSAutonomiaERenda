import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LivrosController } from './livros.controller';
import { LivrosService } from './livros.service';

describe('LivrosController', () => {
  let controller: LivrosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LivrosController],
      providers: [LivrosService],
    }).compile();

    controller = module.get<LivrosController>(LivrosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('buscarPorId deve retornar o livro 1', () => {
    expect(controller.buscarPorId('1')).toEqual({
      id: 1,
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
    });
  });

  it('buscarPorId deve retornar o livro 2', () => {
    expect(controller.buscarPorId('2')).toEqual({
      id: 2,
      titulo: '1984',
      autor: 'George Orwell',
    });
  });

  it('buscarPorId deve lançar NotFoundException para um ID inexistente', () => {
    expect(() => controller.buscarPorId('999')).toThrow(NotFoundException);
  });
});
