import { Injectable, NotFoundException } from '@nestjs/common';
import { Livro } from './interfaces/livro.interface';

@Injectable()
export class LivrosService {
  // Aula 10: acervo simulado em memória - Atividade Prática "O Bibliotecário Automatizado".
  private readonly livros: Livro[] = [
    { id: 1, titulo: 'Dom Casmurro', autor: 'Machado de Assis' },
    { id: 2, titulo: '1984', autor: 'George Orwell' },
    { id: 3, titulo: 'O Cortiço', autor: 'Aluísio Azevedo' },
  ];

  findOne(id: number): Livro {
    const livro = this.livros.find((l) => l.id === id);
    if (!livro) {
      throw new NotFoundException(`Livro com ID ${id} não localizado em nosso acervo`);
    }
    return livro;
  }
}
