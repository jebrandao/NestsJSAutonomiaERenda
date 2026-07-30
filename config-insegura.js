// Aula 05: "Operação Cofre Aberto" - ponto de partida inseguro.
// PERIGO: chave de API "hardcoded" diretamente no código-fonte. Se este
// arquivo for versionado, a chave fica exposta para qualquer pessoa com
// acesso ao repositório — e permanece no histórico do Git mesmo se
// removida depois.
const API_KEY = 'chave-fake-para-demonstracao-aula05-000111222';

function chamarApiExterna() {
  console.log(`Chamando API externa com a chave: ${API_KEY}`);
}

chamarApiExterna();
