# backend-nestjs

Backend do curso de Codificação para Back-End (SENAI-CRTI), construído em aulas sucessivas até chegar em NestJS.

## Configuração

Copie `.env.example` para `.env` e preencha os valores antes de rodar o projeto:

```bash
cp .env.example .env
```

| Variável   | Obrigatória | Descrição                                  |
| ---------- | ----------- | ------------------------------------------- |
| API_KEY    | Sim         | Chave da API externa usada pela aplicação.  |
| PORT       | Não (padrão 3000) | Porta em que o servidor HTTP sobe.    |
| NODE_ENV   | Não (padrão development) | Ambiente de execução.          |

O arquivo `.env` nunca deve ser commitado — apenas `.env.example`, que serve de modelo para o time.
