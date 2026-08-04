import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { FiltrosProdutoDto } from './dto/filtros-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { Produto } from './schemas/produto.schema';

const ITENS_POR_PAGINA = 5;
const ESTOQUE_CRITICO = 5;

@Injectable()
export class ProdutosService {
  constructor(@InjectModel(Produto.name) private readonly produtoModel: Model<Produto>) {}

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

  // Aula 23: findOne migrado do array em memória (Aula 15) para o MongoDB —
  // necessário porque o PATCH desta aula opera sobre o _id real do Mongo, e
  // não faria sentido ter duas "identidades" de produto diferentes na API.
  async findOne(id: string) {
    let produto: Produto | null;
    try {
      produto = await this.produtoModel.findById(id).select('-__v');
    } catch (error) {
      if ((error as Error).name === 'CastError') {
        throw new BadRequestException('O ID fornecido não é um ObjectId válido');
      }
      throw error;
    }

    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    return produto;
  }

  // Aula 23: Atividade Prática - "Atualização de Status Industrial".
  async update(id: string, updateProdutoDto: UpdateProdutoDto) {
    let produtoAtualizado: Produto | null;
    try {
      produtoAtualizado = await this.produtoModel
        .findByIdAndUpdate(id, { $set: updateProdutoDto }, { returnDocument: 'after', runValidators: true })
        .select('-__v');
    } catch (error) {
      if ((error as Error).name === 'CastError') {
        throw new BadRequestException('O ID fornecido não é um ObjectId válido');
      }
      if ((error as { code?: number }).code === 11000) {
        throw new ConflictException('Este equipamento já está registrado no sistema');
      }
      if ((error as Error).name === 'ValidationError') {
        const mensagens = Object.values(
          (error as unknown as { errors: Record<string, { message: string }> }).errors,
        ).map((e) => e.message);
        throw new BadRequestException(mensagens.join(', '));
      }
      throw error;
    }

    if (!produtoAtualizado) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }

    // Regra de Negócio: Alerta de Estoque Crítico.
    if (updateProdutoDto.estoque !== undefined && updateProdutoDto.estoque < ESTOQUE_CRITICO) {
      console.log('Atenção: Estoque Crítico');
    }

    return produtoAtualizado;
  }

  // Aula 24: Atividade Prática - "Limpeza Segura de Estoque".
  // Reaproveita findOne() para validar existência do ID (404/400) e checar o
  // estoque antes de decidir se a exclusão pode prosseguir.
  async delete(id: string): Promise<void> {
    const produto = await this.findOne(id);

    // Regra de Segurança: nunca excluir produto com itens em estoque.
    if (produto.estoque > 0) {
      throw new BadRequestException('Não é possível excluir produtos com itens em estoque');
    }

    await this.produtoModel.findByIdAndDelete(id);
  }
}
