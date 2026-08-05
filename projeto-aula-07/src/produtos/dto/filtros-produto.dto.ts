import { ApiPropertyOptional } from '@nestjs/swagger';

// Aula 22: Atividade Prática - "O Catálogo Inteligente".
// Parâmetros de busca capturados via @Query() — sempre chegam como string.
export class FiltrosProdutoDto {
  @ApiPropertyOptional({
    example: '64f1a2b3c4d5e6f7a8b9c0d1',
    description:
      'ObjectId de uma Categoria, para filtrar produtos dessa categoria',
  })
  categoria?: string;

  @ApiPropertyOptional({ enum: ['preco_asc', 'preco_desc'] })
  ordenar?: 'preco_asc' | 'preco_desc';

  @ApiPropertyOptional({
    description: 'Página de resultados (5 itens por página)',
    example: '1',
  })
  pagina?: string;
}
