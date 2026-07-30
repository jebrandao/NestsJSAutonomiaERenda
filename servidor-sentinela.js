// Aula 06: Atividade Prática - "O Servidor Sentinela"
// Servidor HTTP puro, usando apenas o módulo nativo http (sem frameworks).
import http from 'http';

const PORTA = 3000;

const servidor = http.createServer((req, res) => {
  // Requisito: logar o método HTTP de cada requisição recebida.
  console.log(`Método: ${req.method} | Rota: ${req.url}`);

  // Headers básicos de segurança vistos na aula.
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.url === '/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ servidor: 'online' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ erro: 'Página não encontrada' }));
});

servidor.listen(PORTA, () => {
  console.log(`Sentinela ativo! http://localhost:${PORTA}`);
});
