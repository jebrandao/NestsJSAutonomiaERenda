import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

// Aula 25: Atividade Prática - "Relacionando Produtos e Categorias".
@Schema()
export class Categoria {
  @Prop({ required: true })
  nome: string;

  @Prop()
  descricao: string;
}

export const CategoriaSchema = SchemaFactory.createForClass(Categoria);
