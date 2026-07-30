// Aula 05: Atividade Prática - "Operação Cofre Aberto" (versão corrigida).
// Carrega variáveis de ambiente do .env antes de qualquer outro código.
import 'dotenv/config';

const API_KEY = process.env.API_KEY;
const PORTA = process.env.PORT || 3000;
const AMBIENTE = process.env.NODE_ENV || 'development';

// Falha rápido e com mensagem clara se faltar uma variável obrigatória —
// é o erro "intencional" que a atividade pede para provocar rodando o
// script sem o arquivo .env.
if (!API_KEY) {
  throw new Error(
    'API_KEY não definida. Copie .env.example para .env e preencha os valores antes de rodar a aplicação.',
  );
}

function chamarApiExterna() {
  // A chave nunca é exibida por completo, nem em log local.
  console.log(`Chamando API externa com a chave: ${API_KEY.slice(0, 8)}... (mascarada)`);
}

console.log(`Ambiente: ${AMBIENTE}`);
console.log(`Porta configurada: ${PORTA}`);
chamarApiExterna();
