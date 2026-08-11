import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { AppModule } from '../app.module';
import { Usuario } from '../usuarios/schemas/usuario.schema';
import { Role } from '../auth/role.enum';

// Aula 37: Atividade Prática - "O Lançamento Oficial" (passo 2).
// Cria o primeiro usuário Admin em um banco de produção recém-provisionado.
// Idempotente por design: rodar de novo depois que o Admin já existe não
// cria um segundo — sem essa checagem, cada deploy re-executando o seed
// duplicaria o cadastro (ou colidiria com o índice único de e-mail).
//
// Rodar (contra o .env carregado pelo ambiente atual):
//   npm run seed              # dev, lê .env
//   NODE_ENV=production npm run seed   # produção, lê .env.production
async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });

  try {
    // Acesso direto ao Model (não ao UsuariosService): o cadastro público
    // (UsuariosService.create + CreateUsuarioDto) não aceita roles no corpo
    // de propósito, desde a Aula 32 — evita que um cliente se autopromova a
    // admin. Este script roda só no servidor, fora da API pública, então
    // pode atribuir Role.ADMIN diretamente.
    const usuarioModel = app.get<Model<Usuario>>(getModelToken(Usuario.name));

    const adminExistente = await usuarioModel.findOne({ roles: Role.ADMIN });
    if (adminExistente) {
      console.log(
        `Usuário Admin já existe (${adminExistente.email}) — nada a fazer.`,
      );
      return;
    }

    const email = process.env.ADMIN_EMAIL;
    const senha = process.env.ADMIN_SENHA;

    if (!email || !senha) {
      console.error(
        'Defina ADMIN_EMAIL e ADMIN_SENHA no .env (ou .env.production) antes de rodar o seed.',
      );
      process.exitCode = 1;
      return;
    }

    // .create() aciona o pre('save') do Schema (Aula 26): a senha entra em
    // texto puro aqui e sai como hash bcrypt no banco — a mesma garantia de
    // qualquer outro cadastro, nenhuma lógica de hashing duplicada aqui.
    const admin = await usuarioModel.create({
      nome: 'Admin',
      email,
      senha,
      roles: [Role.ADMIN],
    });

    console.log(`Usuário Admin criado com sucesso: ${admin.email}`);
  } finally {
    await app.close();
  }
}

seed().catch((error: unknown) => {
  console.error('Falha ao rodar o seed:', error);
  process.exitCode = 1;
});
