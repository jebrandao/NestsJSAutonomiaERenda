// Aula 02: módulo de utilidade em ESM (export nomeado)
export function formatLog(mensagem) {
  const data = new Date().toISOString().slice(0, 10);
  return `[${data}] - ${mensagem}`;
}
