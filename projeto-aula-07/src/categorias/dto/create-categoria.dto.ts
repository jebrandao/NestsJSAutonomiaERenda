import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Ferramentas Manuais' })
  nome: string;

  @ApiPropertyOptional({ example: 'Ferramentas operadas manualmente, sem motor.' })
  descricao?: string;
}
