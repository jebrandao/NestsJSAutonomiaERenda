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

  // Aula 35: unique: true saiu daqui — a unicidade agora é garantida por um
  // índice parcial abaixo, que ignora contas anonimizadas (Direito ao
  // Esquecimento). Sem isso, a 2ª conta excluída bateria de frente com a
  // 1ª: as duas teriam o mesmo e-mail "USUÁRIO_ANONIMIZADO" (erro 11000).
  @Prop({ required: true, trim: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  senha: string;

  // Aula 32: Atividade Prática - "Sistema de Controle de Fábrica".
  // Array (um usuário pode ter mais de um papel), com default seguro:
  // todo cadastro novo entra como o papel menos privilegiado (operador).
  // enum: Role faz o Mongoose rejeitar qualquer valor fora do enum.
  @Prop({ type: [String], enum: Role, default: [Role.OPERADOR] })
  roles: Role[];

  // Aula 33: Atividade Prática - "O Token Infinito (mas seguro)".
  // Nunca o Refresh Token puro — só o hash, no mesmo raciocínio da senha.
  // Sem default: usuários recém-cadastrados não têm sessão até fazer login.
  @Prop()
  refreshTokenHash?: string;

  // Aula 35: Atividade Prática - "Auditoria LGPD" (Direito ao Esquecimento).
  // Presença deste campo = conta anonimizada. Nunca apagamos o documento de
  // verdade (o _id precisa sobreviver para integridade referencial de
  // qualquer coisa que aponte para este usuário); só os dados pessoais são
  // substituídos.
  @Prop()
  dataExclusao?: Date;

  // Só existe para viabilizar o índice parcial abaixo — o MongoDB não
  // aceita { $exists: false } em partialFilterExpression (só $exists: true
  // e comparações de igualdade), então "conta ativa" precisa ser expresso
  // como ativo: true, não como "dataExclusao ausente".
  @Prop({ default: true })
  ativo: boolean;
}

export const UsuarioSchema = SchemaFactory.createForClass(Usuario);

// Índice único PARCIAL: exige e-mail único só entre contas ainda ativas.
// Contas anonimizadas (ativo: false) compartilham o mesmo valor de e-mail
// sem violar a unicidade.
UsuarioSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { ativo: true } },
);

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
