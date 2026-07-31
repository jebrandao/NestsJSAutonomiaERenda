import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Aula 20: Atividade Prática - "Modelagem de Inventário Industrial".
// Contrato de dados do Produto persistido no MongoDB via Mongoose.
@Schema({ timestamps: true })
export class Produto {
  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ required: true, min: 0 })
  preco: number;

  @Prop({
    required: true,
    enum: ['Eletrônicos', 'Ferramentas', 'EPI'],
  })
  categoria: string;

  @Prop({ default: 0, min: 0 })
  estoque: number;

  @Prop({ default: true })
  ativo: boolean;
}

export const ProdutoSchema = SchemaFactory.createForClass(Produto);
