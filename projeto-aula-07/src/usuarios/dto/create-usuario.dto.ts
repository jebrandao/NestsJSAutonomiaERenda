import { ApiProperty } from '@nestjs/swagger';

export class CreateUsuarioDto {
  @ApiProperty({ example: 'Ana Torres' })
  nome: string;

  @ApiProperty({ example: 'ana.torres@empresa.com' })
  email: string;

  @ApiProperty({ example: 'senhaSuperSecreta123' })
  senha: string;
}
