// Atividade Prática - Aula 01: Diagnóstico de Ambiente
// Usa o módulo nativo 'os', exclusivo do Node.js (não existe no navegador),
// para provar que este script só pode rodar do lado do servidor.
const os = require('os');

console.log('Plataforma:', os.platform());
console.log('Memória total:', os.totalmem());
console.log('CPUs:', os.cpus().length);
