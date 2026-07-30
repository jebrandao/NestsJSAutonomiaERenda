// Aula 02: Atividade Prática - Organizador de Logs
// Demonstra import/export (ESM) e os módulos nativos fs e path.
import fs from 'fs';
import path from 'path';
import { formatLog } from './utils.js';

const pastaLogs = path.join(process.cwd(), 'logs');
const arquivoLog = path.join(pastaLogs, 'system.log');

if (!fs.existsSync(pastaLogs)) {
  fs.mkdirSync(pastaLogs);
  console.log('Pasta logs/ criada.');
}

const mensagem = formatLog('Sistema iniciado com sucesso.');
fs.writeFileSync(arquivoLog, mensagem + '\n');

console.log('Log salvo em:', arquivoLog);
console.log('Conteúdo:', mensagem);
