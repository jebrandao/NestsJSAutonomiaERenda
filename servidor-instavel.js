// Aula 04: "O Servidor Imortal" - ponto de partida instável (com bugs).
// API Express com 3 bugs propositais que derrubam o processo em cenários
// diferentes. Serve de baseline para comparar com servidor-imortal.js.
import express from 'express';

const app = express();
app.use(express.json());
const PORTA = 3000;

function enviarNotificacaoPedido(pedidoId) {
  // Simula uma falha aleatória em um serviço externo de notificação.
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.5) {
        reject(new Error(`Falha ao notificar pedido ${pedidoId}`));
        return;
      }
      resolve();
    }, 10);
  });
}

// BUG 1: erro síncrono sem tratamento dentro da rota.
app.get('/produtos/:id', (req, res) => {
  const id = req.params.id;
  if (!/^\d+$/.test(id)) {
    throw new Error(`ID de produto inválido: "${id}"`);
  }
  res.json({ id: Number(id), nome: `Produto ${id}` });
});

// BUG 2: tarefa em segundo plano fora do ciclo de requisição/resposta do
// Express, que lança um erro síncrono dentro de um callback de timer.
app.get('/relatorios/:id', (req, res) => {
  res.json({ status: 'processando', id: req.params.id });

  setTimeout(() => {
    const relatorio = null;
    console.log('Linhas do relatório:', relatorio.length); // TypeError
  }, 10);
});

// BUG 3: tarefa "fire-and-forget" que pode rejeitar sem ninguém tratando.
app.post('/pedidos', (req, res) => {
  const pedidoId = Date.now();
  res.status(201).json({ pedidoId, status: 'recebido' });
  enviarNotificacaoPedido(pedidoId);
});

app.listen(PORTA, () => {
  console.log(`[INSTÁVEL] Servidor rodando em http://localhost:${PORTA}`);
});
