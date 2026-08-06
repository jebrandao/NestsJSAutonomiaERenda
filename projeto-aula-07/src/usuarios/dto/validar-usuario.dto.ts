import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

// Aula 34: mesmo raciocínio do LoginDto — este DTO alimenta o mesmo
// usuarioModel.findOne({ email }) via UsuariosService.validarCredenciais(),
// então está exposto ao mesmo vetor de NoSQL Injection.
export class ValidarUsuarioDto {
  @ApiProperty({ example: 'ana.torres@empresa.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'senhaSuperSecreta123' })
  @IsString()
  @IsNotEmpty()
  senha: string;
}
