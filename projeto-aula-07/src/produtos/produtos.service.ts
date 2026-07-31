import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Produto } from './interfaces/produto.interface';

@Injectable()
export class ProdutosService {
  // Aula 15: acervo simulado em memória - Atividade Prática "O Sistema Anti-Falhas".
  private readonly produtos: Produto[] = [
    { id: 1, nome: 'Notebook', preco: 3500 },
    { id: 2, nome: 'Mouse', preco: 80 },
    { id: 3, nome: 'Teclado', preco: 150 },
  ];

  findOne(idParam: string): Produto {
    // Erro 1: o ID informado na rota não é um número inteiro.
    if (!/^\d+$/.test(idParam)) {
      throw new BadRequestException('O ID fornecido deve ser do tipo inteiro');
    }

    const id = Number(idParam);
    const produto = this.produtos.find((p) => p.id === id);

    // Erro 2: o ID é um número válido, mas não existe nenhum produto com ele.
    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return produto;
  }
}
