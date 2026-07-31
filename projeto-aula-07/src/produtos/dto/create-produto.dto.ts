import { ApiProperty } from '@nestjs/swagger';

// Aula 17: exemplos usados na documentação Swagger.
// Aula 21: campo categoria adicionado — obrigatório no Schema do MongoDB (Aula 20).
export class CreateProdutoDto {
  @ApiProperty({ example: 'Torno CNC X200' })
  nome: string;

  @ApiProperty({ example: 25.9 })
  preco: number;

  @ApiProperty({ example: 'Ferramentas', enum: ['Eletrônicos', 'Ferramentas', 'EPI'] })
  categoria: string;
}
