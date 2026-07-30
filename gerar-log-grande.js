// Aula 03: gera um arquivo de log grande para testar o processamento por Streams.
// Uso: node gerar-log-grande.js [quantidadeDeLinhas]
import fs from 'fs';

const TOTAL_LINHAS = Number(process.argv[2]) || 1_000_000;
const CAMINHO = 'logs/grande.log';

const nivel = (i) => (i % 37 === 0 ? 'ERROR' : i % 11 === 0 ? 'WARN' : 'INFO');

const writeStream = fs.createWriteStream(CAMINHO);

let i = 0;
function escrever() {
  // Respeita o backpressure: se write() retornar false, o buffer interno
  // está cheio e é preciso esperar o evento 'drain' antes de continuar.
  let podeContinuar = true;
  while (i < TOTAL_LINHAS && podeContinuar) {
    i++;
    const linha = `${new Date().toISOString()} [${nivel(i)}] Mensagem de log numero ${i}\n`;
    podeContinuar = writeStream.write(linha);
  }

  if (i < TOTAL_LINHAS) {
    writeStream.once('drain', escrever);
  } else {
    writeStream.end();
  }
}

writeStream.on('finish', () => {
  const { size } = fs.statSync(CAMINHO);
  console.log(`Arquivo gerado: ${CAMINHO} (${(size / 1024 / 1024).toFixed(2)} MB, ${TOTAL_LINHAS} linhas)`);
});

escrever();
