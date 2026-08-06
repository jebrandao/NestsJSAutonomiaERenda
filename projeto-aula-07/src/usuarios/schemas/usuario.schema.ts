import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Role } from '../../auth/role.enum';

const SALT_ROUNDS = 10;

// Aula 26: Atividade Prática - "O Guardião de Acessos".
// pre('save') garante que a senha NUNCA seja persistida em texto puro,
// não importa qual camada da aplicação (controller, service, seed) disparou
// a gravação.
@Schema({ timestamps: true })
export class Usuario {
  @Prop({ required: true, trim: true })
  nome: string;

  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  senha: string;

  // Aula 32: Atividade Prática - "Sistema de Controle de Fábrica".
  // Array (um usuário pode ter mais de um papel), com default seguro:
  // todo cadastro novo entra como o papel menos privilegiado (operador).
  // enum: Role faz o Mongoose rejeitar qualquer valor fora do enum.
  @Prop({ type: [String], enum: Role, default: [Role.OPERADOR] })
  roles: Role[];
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

// function(), nunca arrow function: o hook precisa do `this` do documento
// sendo salvo, que uma arrow function não possui (quebraria o acesso a
// this.senha abaixo).
// Nota: a tipagem do Mongoose 9 instalado neste projeto espera o estilo
// assíncrono por Promise (sem callback next) para pre('save') — o mesmo
// hook do slide, escrito com function(next), mas nesta versão o retorno da
// Promise já sinaliza a conclusão do middleware.
UsuarioSchema.pre('save', async function () {
  // isModified evita re-criptografar um hash que já é hash — sem essa
  // checagem, um PATCH que só altera o nome geraria um novo hash da senha
  // a cada vez e o login pararia de funcionar.
  if (!this.isModified('senha')) return;

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  this.senha = await bcrypt.hash(this.senha, salt);
});
