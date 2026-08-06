// Aula 32: Atividade Prática - "Sistema de Controle de Fábrica".
// Enum em vez de string solta: o TypeScript aponta erro em tempo de
// compilação se alguém usar um role que não existe, e o Mongoose usa o
// mesmo enum para validar em runtime (ver usuarios/schemas/usuario.schema.ts).
export enum Role {
  ADMIN = 'admin',
  OPERADOR = 'operador',
}
