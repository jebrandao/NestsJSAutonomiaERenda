// Aula 14: simula localmente o ambiente Serverless (sem vercel dev/netlify dev
// instalados), para medir o TTFB do cenário "Ambiente Local" da atividade.
import http from 'http';
import handler from './api/hora.js';

const PORTA = 4000;

function criarRespostaCompativel(res) {
  return {
    status(codigo) {
      res.statusCode = codigo;
      return {
        json(corpo) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(corpo));
        },
      };
    },
  };
}

http
  .createServer((req, res) => {
    handler(req, criarRespostaCompativel(res));
  })
  .listen(PORTA, () => {
    console.log(`Função rodando localmente em http://localhost:${PORTA}/api/hora`);
  });
