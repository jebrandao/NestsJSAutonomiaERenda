# Guia de Implantação — Backend NestJS (Codificação para Back-End, SENAI-CRTI)

> Aula 40 — Atividade Prática "O Manual do Sistema". Documento de handover técnico: qualquer pessoa da equipe deve conseguir clonar o repositório, subir o sistema em produção e validar que está funcionando, só seguindo este guia.

## Sumário

1. [Guia de Inicialização Rápida](#1-guia-de-inicialização-rápida)
2. [Tabela de Configuração](#2-tabela-de-configuração)
3. [Mapa de Rotas Protegidas](#3-mapa-de-rotas-protegidas)
4. [Evidência de Validação (UAT)](#4-evidência-de-validação-uat)
5. [Instrução de Backup (MongoDB Atlas)](#5-instrução-de-backup-mongodb-atlas)
6. [Débitos técnicos conhecidos](#6-débitos-técnicos-conhecidos)

---

## 1. Guia de Inicialização Rápida

Comandos para rodar o sistema em produção depois de clonar o repositório. Pressupõe Node.js na mesma versão (ou superior) usada em desenvolvimento e um cluster MongoDB já provisionado (ver seção 2).

```bash
git clone https://github.com/jebrandao/NestsJSAutonomiaERenda.git
cd NestsJSAutonomiaERenda/backend-nestjs/projeto-aula-07

# 1) Instalar dependências
npm install

# 2) Criar o .env.production a partir do modelo (nunca commitar o real)
cp .env.production.example .env.production
# edite .env.production preenchendo os valores reais (ver Tabela de Configuração)

# 3) Compilar o TypeScript para produção
NODE_ENV=production npm run build

# 4) Popular o usuário Admin (idempotente — seguro rodar mais de uma vez)
NODE_ENV=production npm run seed

# 5a) Subir direto
NODE_ENV=production node dist/main.js

# 5b) OU subir com o PM2 (reinício automático em caso de crash)
npm install -D pm2
NODE_ENV=production npx pm2 start dist/main.js --name "api-senai"
npx pm2 status
npx pm2 logs api-senai
```

Depois de subir, confirme com o Health Check antes de qualquer outra coisa:

```bash
curl http://localhost:$PORT/status
# esperado: {"status":"ok","timestamp":"...","database":"connected","version":"..."}
```

**Simulação de instalação isolada** (recomendado antes do deploy real — reproduz um servidor limpo, sem `node_modules` de desenvolvimento): copie só `dist/`, `package.json`, `package-lock.json` e `.env.production` para uma pasta separada, rode `npm install --production` e inicie com `node dist/main.js`. Esse fluxo foi testado e documentado na Aula 37.

---

## 2. Tabela de Configuração

Todas as variáveis de ambiente que o sistema lê. Sem qualquer uma destas, o boot falha ou algo quebra silenciosamente — nenhuma delas tem um valor de fallback seguro para produção.

| Variável | Obrigatória | Finalidade | Onde é lida |
|---|---|---|---|
| `NODE_ENV` | Sim | Define qual arquivo `.env` é carregado: `production` → `.env.production`, qualquer outro valor (ou ausente) → `.env`. Precisa ser exportada no shell **antes** do processo iniciar (`NODE_ENV=production node dist/main.js`), nunca só dentro do próprio `.env.production` — o `ConfigModule` lê essa variável antes mesmo de abrir o arquivo. | `src/app.module.ts` |
| `PORT` | Não (default `3000`) | Porta em que o servidor escuta. Em produção, normalmente atrás de um proxy reverso (Nginx) ou do roteamento da plataforma Cloud. | `src/main.ts` |
| `DATABASE_URL` | Sim | Connection string do MongoDB (Atlas em produção). Nunca a mesma URI usada em desenvolvimento — evita misturar dados reais com dados de teste. | `src/app.module.ts` |
| `JWT_SECRET` | Sim | Chave usada para assinar/validar os Access Tokens emitidos no login. Gere um valor novo e aleatório só para produção — nunca reaproveite o de desenvolvimento. | `src/app.module.ts`, `src/auth/jwt.strategy.ts` |
| `JWT_REFRESH_SECRET` | Sim | Chave separada da `JWT_SECRET`, usada só para os Refresh Tokens (Aula 33). Isola os dois tipos de token: um vazando não compromete o outro automaticamente. | `src/auth/auth.service.ts`, `src/auth/jwt-refresh.strategy.ts` |
| `ADMIN_EMAIL` | Só para rodar o seed | E-mail do primeiro usuário Admin, criado pelo script de seed (Aula 37). | `src/scripts/seed.ts` |
| `ADMIN_SENHA` | Só para rodar o seed | Senha do primeiro usuário Admin. **Sempre entre aspas no `.env`** — um valor sem aspas contendo `#` é cortado ali pelo dotenv (o resto vira "comentário" e é descartado em silêncio, sem erro). Ex.: `ADMIN_SENHA="Adm1n#Segura2026!"`. | `src/scripts/seed.ts` |

Como gerar um valor aleatório seguro para os secrets:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Modelo completo e comentado: [`/.env.production.example`](./.env.production.example) (versionado no repositório; o `.env.production` real nunca é commitado — `.gitignore` já cobre `.env.*`, exceto os `*.example`).

---

## 3. Mapa de Rotas Protegidas

Levantamento feito lendo o código de todos os Controllers (não um resumo de memória) — reflete o estado real do sistema nesta entrega, incluindo as inconsistências encontradas (ver seção 6).

### Rotas que exigem JWT válido (`JwtAuthGuard` — Access Token no header `Authorization: Bearer <token>`)

| Rota | Observação |
|---|---|
| `POST /produtos` | Guard aplicado no nível da classe `ProdutosController` |
| `GET /produtos` | idem |
| `GET /produtos/:id` | idem |
| `PATCH /produtos/:id` | idem |
| `DELETE /produtos/:id` | JWT **+** Role Admin (ver abaixo) |
| `DELETE /usuarios/:id` | Guard aplicado só neste método (Aula 35 — exclusão do titular precisa ser autenticada) |

### Rotas que exigem JWT + papel Admin (`JwtAuthGuard` + `RolesGuard` + `@Roles(Role.ADMIN)`)

| Rota | Observação |
|---|---|
| `DELETE /produtos/:id` | Único endpoint do sistema com controle de papel (RBAC, Aula 32). Operador autenticado recebe `403 Forbidden`; sem token, `401 Unauthorized`. |

### Rota com guard específico de Refresh Token (`JwtRefreshAuthGuard` — não é o mesmo guard usado nas rotas acima)

| Rota | Observação |
|---|---|
| `POST /auth/refresh` | Valida o **Refresh Token** (assinado com `JWT_REFRESH_SECRET`, verificado contra o hash salvo no banco), não o Access Token. Não confundir com `JwtAuthGuard`. |

### Rotas públicas (sem nenhum Guard)

`GET /api`, `GET /status`, `POST /auth/login` (com rate limit de 10 req/min por IP), `POST /usuarios`, `GET /usuarios`, `GET /usuarios/:id`, `PATCH /usuarios/:id`, `POST /usuarios/validar`, `POST /categorias`, `GET /categorias`, `GET /convidados`, `POST /convidados`, `PATCH /convidados/:id`, `DELETE /convidados/:id`, `GET /livros/:id`, `POST /media/upload`, `POST /colaboradores`.

### Rotas com controle de acesso "manual" (fora do sistema de Guards do Nest — não confundir com JWT)

| Rota | Como é protegida |
|---|---|
| `GET /admin` | `LoggerMiddleware` global bloqueia com 403 se o header `x-user-role` não for exatamente `supervisor`. **Não é JWT** — o valor vem direto do header enviado pelo cliente, então é facilmente forjável. Serve como demonstração didática do conceito (Aula 13), não como controle de acesso real. |
| `GET /secreto` | O próprio handler compara o header `x-api-key` com a string fixa `SENAI-2026`. Mesma ressalva: não é autenticação real. |

---

## 4. Evidência de Validação (UAT)

Fluxo E2E completo executado localmente em modo produção (`NODE_ENV=production node dist/main.js`, build de `/dist`, banco `backend-nestjs-producao` — separado do banco de desenvolvimento), reproduzindo os três blocos de verificação pedidos pelo processo de UAT: Sanity Check, Fluxo Completo e Verificação de Segurança/Permissão.

**Sanity Check** — servidor sobe e responde:

```
$ curl http://localhost:3001/status
{"status":"ok","timestamp":"2026-08-11T17:51:11.000Z","database":"connected","version":"0.0.1"}
```

Nenhum `ERROR` nos logs da sessão de subida (log completo checado, sem falhas críticas).

**Fluxo completo — Cadastro → Login → JWT → CRUD com token:**

```
$ curl -X POST /usuarios -d '{"nome":"UAT Operador","email":"uat.operador@empresa.com","senha":"SenhaUAT123!"}'
{"_id":"6a7b611e1972a1c2118e1c48","nome":"UAT Operador","email":"uat.operador@empresa.com","roles":["operador"], ...}

$ curl -X POST /auth/login -d '{"email":"uat.operador@empresa.com","senha":"SenhaUAT123!"}'
{"access_token":"eyJhbGci...", "refresh_token":"eyJhbGci..."}

$ curl -X POST /produtos -H "Authorization: Bearer <token>" -d '{"nome":"Chave Combinada","preco":45,"categoria":"<id>"}'
-> 201 Created

$ curl /produtos -H "Authorization: Bearer <token>"           -> 200 OK
$ curl -X PATCH /produtos/<id> -H "Authorization: Bearer <token>" -d '{"preco":50}'  -> 200 OK
```

**Verificação de Segurança:**

```
$ mongosh --eval "db.usuarios.findOne({email:'uat.operador@empresa.com'}, {senha:1})"
{ senha: '$2b$10$f//a0Bzr6B8fWrq1ymM.AuXWJmdb9kcTSt.0unXg/seoFujex066i' }
```

Senha salva como hash bcrypt, nunca em texto puro — confirmado.

**Teste de Permissão** (o usuário acima tem role `operador`, não `admin`):

```
$ curl -i -X DELETE /produtos/<id> -H "Authorization: Bearer <token-do-operador>"
HTTP/1.1 403 Forbidden
```

Operador corretamente barrado da rota restrita a Admin — `RolesGuard` funcionando como esperado.

Dados de teste desta validação foram removidos do banco (`db.dropDatabase()`) ao final — nenhum dado "sujo" permaneceu no banco de produção.

---

## 5. Instrução de Backup (MongoDB Atlas)

**Opção 1 — Backup gerenciado pelo Atlas (recomendado para produção):**

Clusters M10+ do Atlas têm Continuous Backup nativo (point-in-time restore) configurável direto no painel: `Cluster → Backup → Enable`. Para o free tier (M0), o Atlas não oferece backup automático — use a Opção 2.

**Opção 2 — Dump manual com `mongodump`/`mongorestore`:**

```bash
# Instalar o Database Tools do MongoDB (se ainda não tiver):
# https://www.mongodb.com/try/download/database-tools

# Dump completo do banco de produção (pede a senha do usuário do Atlas):
mongodump --uri="mongodb+srv://usuario:senha@seu-cluster.mongodb.net/nomeDoBanco" \
  --out=./backups/$(date +%Y-%m-%d_%H-%M-%S)

# Restaurar um dump (ex.: em caso de rollback de dados):
mongorestore --uri="mongodb+srv://usuario:senha@seu-cluster.mongodb.net/nomeDoBanco" \
  ./backups/2026-08-11_14-00-00/nomeDoBanco
```

Recomendações:

- Automatize o `mongodump` via cron/agendador (ex.: diário, fora do horário de pico) e envie o resultado para um storage externo (S3, Google Cloud Storage) — nunca deixe o backup só na mesma máquina do servidor.
- Nunca commite um dump no Git — ele contém dados reais de usuários (mesmo com senhas hasheadas, e-mails e outros dados pessoais são PII sob a LGPD, ver Aula 35).
- Teste o `mongorestore` periodicamente em um ambiente separado — um backup nunca testado é um backup que pode não funcionar quando for realmente necessário.

---

## 6. Débitos técnicos conhecidos

Registrados aqui porque o objetivo de um handover é a próxima equipe não descobrir isso durante um incidente. Levantados rodando o "Teste de Permissão" pedido pela atividade desta aula.

- **A maior parte das rotas do sistema é pública.** Só `produtos/*` tem `JwtAuthGuard` (aplicado no nível da classe) e só `DELETE /produtos/:id` exige o papel Admin. Não existe nenhum `APP_GUARD` global — proteção é opt-in por controller, então qualquer controller novo criado sem `@UseGuards(JwtAuthGuard)` explícito nasce público por padrão.
- **`UsuariosController` está inconsistente.** `GET /usuarios` devolve a lista de todos os usuários sem autenticação nenhuma; `PATCH /usuarios/:id` permite editar qualquer usuário, de qualquer ID, sem token. Só `DELETE /usuarios/:id` (Aula 35) exige JWT. Isso é uma exposição real de dados de usuários (e-mail, roles) e um vetor de escrita não autenticado — deveria ser corrigido antes de qualquer exposição pública real do sistema.
- **`GET /admin` e `GET /secreto` não usam o sistema de Guards do Nest.js.** São checagens manuais de headers (`x-user-role`, `x-api-key`) escritas direto no middleware/handler — funcionais como demonstração didática das aulas iniciais do curso, mas não substituem autenticação JWT real (o valor do header é definido pelo próprio cliente, então é trivialmente forjável).
- **Convidados, Livros, Media (upload de arquivo) e Colaboradores não têm proteção nenhuma.** Herdados de aulas anteriores focadas em outros conceitos (streams, uploads, validação Zod), nunca revisitados depois que JWT/RBAC foram introduzidos (Aulas 30-32).

---

*Documento gerado como entrega da Aula 40 — "Documentação de Implantação e Encerramento", encerrando a Unidade Curricular "Codificação para Back-End" (SENAI-CRTI, 2026).*
