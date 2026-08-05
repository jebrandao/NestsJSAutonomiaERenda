import { ApiProperty } from '@nestjs/swagger';

export class UpdateUsuarioDto {
  @ApiProperty({ example: 'Ana Torres Silva', required: false })
  nome?: string;

  @ApiProperty({ example: 'ana.nova@empresa.com', required: false })
  email?: string;

  @ApiProperty({ example: 'novaSenhaSegura456', required: false })
  senha?: string;
}
