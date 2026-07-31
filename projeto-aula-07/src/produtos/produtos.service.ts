import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Produto as ProdutoLegado } from './interfaces/produto.interface';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { FiltrosProdutoDto } from './dto/filtros-produto.dto';
import { Produto } from './schemas/produto.schema';

const ITENS_POR_PAGINA = 5;

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

  // Aula 22: Atividade Prática - "O Catálogo Inteligente".
  // Busca com filtro por categoria, ordenação por preço e paginação fixa de
  // 5 itens por página. select('-__v') garante que o campo de versão do
  // Mongoose não vaze na resposta.
  async findAll(filtros: FiltrosProdutoDto) {
    const pagina = Number(filtros.pagina) > 0 ? Number(filtros.pagina) : 1;
    const skip = (pagina - 1) * ITENS_POR_PAGINA;

    const query: { categoria?: string } = {};
    if (filtros.categoria) {
      query.categoria = filtros.categoria;
    }

    const sort: Record<string, 1 | -1> = {};
    if (filtros.ordenar === 'preco_asc') sort.preco = 1;
    if (filtros.ordenar === 'preco_desc') sort.preco = -1;

    return this.produtoModel
      .find(query)
      .select('-__v')
      .sort(sort)
      .skip(skip)
      .limit(ITENS_POR_PAGINA)
      .exec();
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
