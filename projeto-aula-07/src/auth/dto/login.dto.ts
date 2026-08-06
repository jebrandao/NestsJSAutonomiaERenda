import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

// Aula 34: Atividade Prática - "Blindagem de API".
// Sem @IsString(), um payload como {"email":{"$ne":null},"senha":{"$ne":null}}
// chegaria intacto ao UsuariosService.validarCredenciais(), que faz
// usuarioModel.findOne({ email }) — um objeto com operador Mongo aí vira
// NoSQL Injection de verdade (retorna o primeiro usuário cujo e-mail não é
// null, não "usuário nenhum"). O ValidationPipe global (main.ts) rejeita
// isso com 400 antes de qualquer consulta ao banco.
export class LoginDto {
  @ApiProperty({ example: 'ana.torres@empresa.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'senhaSuperSecreta123' })
  @IsString()
  @IsNotEmpty()
  senha: string;
}
