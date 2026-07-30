// Aula 03: Atividade Prática - Desafio do Grande Arquivo
// Lê logs/grande.log linha a linha via Stream (sem carregar o arquivo inteiro
// na memória) e grava em logs/erros.log apenas as linhas que contêm "ERROR".
import fs from 'fs';
import readline from 'readline';

const ORIGEM = 'logs/grande.log';
const DESTINO = 'logs/erros.log';

function formatarMemoria(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function logMemoria(rotulo) {
  const uso = process.memoryUsage();
  console.log(`[${rotulo}] RSS: ${formatarMemoria(uso.rss)} | Heap usado: ${formatarMemoria(uso.heapUsed)}`);
}

const leitura = fs.createReadStream(ORIGEM);
const escrita = fs.createWriteStream(DESTINO);
const rl = readline.createInterface({ input: leitura, crlfDelay: Infinity });

let totalLinhas = 0;
let totalErros = 0;

logMemoria('Início');

rl.on('line', (linha) => {
  totalLinhas++;

  if (linha.includes('ERROR')) {
    totalErros++;
    escrita.write(linha + '\n');
  }

  if (totalLinhas % 200_000 === 0) {
    logMemoria(`${totalLinhas} linhas processadas`);
  }
});

rl.on('close', () => {
  escrita.end(() => {
    logMemoria('Fim');
    console.log(`Total de linhas lidas: ${totalLinhas}`);
    console.log(`Linhas com ERROR encontradas: ${totalErros}`);
    console.log(`Resultado salvo em: ${DESTINO}`);
  });
});
