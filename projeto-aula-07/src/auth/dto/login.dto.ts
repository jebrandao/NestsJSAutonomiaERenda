import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'ana.torres@empresa.com' })
  email: string;

  @ApiProperty({ example: 'senhaSuperSecreta123' })
  senha: string;
}
