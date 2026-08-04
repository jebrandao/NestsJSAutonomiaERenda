import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Categoria } from '../../categorias/schemas/categoria.schema';

// Aula 20: Atividade Prática - "Modelagem de Inventário Industrial".
// Contrato de dados do Produto persistido no MongoDB via Mongoose.
@Schema({ timestamps: true })
export class Produto {
  // Aula 21: unique: true adicionado para o "Desafio de Resiliência" —
  // impede duas gravações com o mesmo nome (erro 11000 do MongoDB).
  @Prop({ required: true, trim: true, unique: true })
  nome: string;

  @Prop({ required: true, min: 0 })
  preco: number;

  // Aula 25: campo migrado de string/enum para referência real (ObjectId) a
  // uma Categoria — antes um valor fixo, agora um relacionamento de verdade,
  // recuperável com .populate('categoria').
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: Categoria.name,
    required: true,
  })
  categoria: Categoria;

  @Prop({ default: 0, min: 0 })
  estoque: number;

  @Prop({ default: true })
  ativo: boolean;
}

export const ProdutoSchema = SchemaFactory.createForClass(Produto);
