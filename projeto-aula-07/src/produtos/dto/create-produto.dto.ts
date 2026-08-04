import { ApiProperty } from '@nestjs/swagger';

// Aula 17: exemplos usados na documentação Swagger.
// Aula 21: campo categoria adicionado — obrigatório no Schema do MongoDB (Aula 20).
// Aula 25: categoria passou a ser o ObjectId de uma Categoria existente
// (relacionamento real, ver produtos/schemas/produto.schema.ts).
export class CreateProdutoDto {
  @ApiProperty({ example: 'Torno CNC X200' })
  nome: string;

  @ApiProperty({ example: 25.9 })
  preco: number;

  @ApiProperty({
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
    description: 'ObjectId de uma Categoria existente (POST /categorias)',
  })
  categoria: string;
}
