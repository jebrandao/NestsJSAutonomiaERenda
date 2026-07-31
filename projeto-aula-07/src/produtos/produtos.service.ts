import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Produto as ProdutoLegado } from './interfaces/produto.interface';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { Produto } from './schemas/produto.schema';

@Injectable()
export class ProdutosService {
  constructor(@InjectModel(Produto.name) private readonly produtoModel: Model<Produto>) {}

  // Aula 15: acervo simulado em memória, ainda usado por findOne() — a
  // migração das buscas para o MongoDB (find/findById) é o assunto da
  // próxima aula. Por enquanto, itens criados via create() (Mongo) não
  // aparecem aqui; é uma inconsistência temporária esperada nesta fase.
  private produtos: ProdutoLegado[] = [
    { id: 1, nome: 'Notebook', preco: 3500 },
    { id: 2, nome: 'Mouse', preco: 80 },
    { id: 3, nome: 'Teclado', preco: 150 },
  ];

  // Aula 21: Atividade Prática - "Cadastro de Maquinário Industrial".
  // Cadastro persistido de verdade no MongoDB via Mongoose.
  async create(createProdutoDto: CreateProdutoDto) {
    try {
      return await this.produtoModel.create(createProdutoDto);
    } catch (error) {
      // Erro de duplicidade (nome: unique: true no Schema).
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('Este equipamento já está registrado no sistema');
      }
      // Falha de validação do Schema (regras de negócio no banco, distintas
      // das já checadas pelo DTO/Zod na camada de entrada da API).
      if ((error as Error).name === 'ValidationError') {
        const mensagens = Object.values(
          (error as unknown as { errors: Record<string, { message: string }> }).errors,
        ).map((e) => e.message);
        throw new BadRequestException(mensagens.join(', '));
      }
      throw error;
    }
  }

  findOne(idParam: string): ProdutoLegado {
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
