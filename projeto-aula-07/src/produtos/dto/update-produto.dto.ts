import { ApiPropertyOptional } from '@nestjs/swagger';

// Aula 23: Atividade Prática - "Atualização de Status Industrial".
// Todos os campos são opcionais — o cliente envia só o que quer alterar.
// Não estende CreateProdutoDto porque este não inclui estoque/ativo
// (que só recebem valor por padrão do Schema na criação, mas precisam
// ser editáveis aqui para a regra de Estoque Crítico).
export class UpdateProdutoDto {
  @ApiPropertyOptional({ example: 'Torno CNC X200' })
  nome?: string;

  @ApiPropertyOptional({ example: 25.9 })
  preco?: number;

  @ApiPropertyOptional({
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
    description: 'ObjectId de uma Categoria existente',
  })
  categoria?: string;

  @ApiPropertyOptional({ example: 3 })
  estoque?: number;

  @ApiPropertyOptional({ example: true })
  ativo?: boolean;
}
