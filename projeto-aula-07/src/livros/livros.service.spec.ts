import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { LivrosService } from './livros.service';

describe('LivrosService', () => {
  let service: LivrosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LivrosService],
    }).compile();

    service = module.get<LivrosService>(LivrosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findOne deve retornar o livro correspondente ao ID', () => {
    expect(service.findOne(1)).toEqual({
      id: 1,
      titulo: 'Dom Casmurro',
      autor: 'Machado de Assis',
    });
  });

  it('findOne deve lançar NotFoundException com a mensagem esperada para ID inexistente', () => {
    expect(() => service.findOne(999)).toThrow(
      new NotFoundException('Livro com ID 999 não localizado em nosso acervo'),
    );
  });
});
