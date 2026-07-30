// Aula 04: Atividade Prática - "O Servidor Imortal"
// Mesma API de servidor-instavel.js, agora protegida em três camadas:
// 1) try/catch nas rotas críticas, 2) middleware de erro global,
// 3) listeners de uncaughtException/unhandledRejection como rede final.
import express from 'express';

const app = express();
app.use(express.json());
const PORTA = 3000;

const usuarios = { 1: { id: 1, nome: 'Ana' }, 2: { id: 2, nome: 'Bruno' } };

function buscarUsuarioPorId(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const usuario = usuarios[id];
      if (!usuario) {
        reject(new Error(`Usuário ${id} não encontrado`));
        return;
      }
      resolve(usuario);
    }, 10);
  });
}

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

// Tarefa 1: rota crítica síncrona isolada em try/catch.
app.get('/produtos/:id', (req, res, next) => {
  try {
    const id = req.params.id;
    if (!/^\d+$/.test(id)) {
      throw new Error(`ID de produto inválido: "${id}"`);
    }
    res.json({ id: Number(id), nome: `Produto ${id}` });
  } catch (error) {
    next(error);
  }
});

// Tarefa 1: rota crítica assíncrona isolada em try/catch.
app.get('/usuarios/:id', async (req, res, next) => {
  try {
    const usuario = await buscarUsuarioPorId(req.params.id);
    res.json(usuario);
  } catch (error) {
    next(error);
  }
});

// Este bug é proposital e não dá para "corrigir" com try/catch local: o
// erro acontece dentro de um setTimeout, depois que a resposta já foi
// enviada ao cliente. A rede de segurança aqui é o listener global de
// uncaughtException (Tarefa 3), não um try/catch na rota.
app.get('/relatorios/:id', (req, res) => {
  res.json({ status: 'processando', id: req.params.id });

  setTimeout(() => {
    const relatorio = null;
    console.log('Linhas do relatório:', relatorio.length); // TypeError
  }, 10);
});

// Fire-and-forget proposital: se enviarNotificacaoPedido rejeitar, quem
// protege o processo é o listener global de unhandledRejection (Tarefa 3).
app.post('/pedidos', (req, res) => {
  const pedidoId = Date.now();
  res.status(201).json({ pedidoId, status: 'recebido' });
  enviarNotificacaoPedido(pedidoId);
});

// Tarefa 2: middleware de erro global — sempre registrado por último,
// depois de todas as rotas, para capturar tudo que chega via next(error).
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  const status = err.status || 400;
  res.status(status).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
  });
});

// Tarefa 3: listeners de processo como última linha de defesa, para os
// erros que escapam do Express (background tasks, fire-and-forget).
process.on('unhandledRejection', (reason) => {
  console.error('[unhandledRejection]', reason instanceof Error ? reason.message : reason);
});

process.on('uncaughtException', (err) => {
  console.error('[uncaughtException]', err.message);
  // Em produção o recomendado é logar, encerrar de forma controlada
  // (graceful shutdown) e deixar um Process Manager (ex: PM2) reiniciar o
  // processo, já que o estado pode ter ficado inconsistente. Aqui, para
  // cumprir o requisito de manter o servidor no ar, apenas registramos.
});

app.listen(PORTA, () => {
  console.log(`[IMORTAL] Servidor rodando em http://localhost:${PORTA}`);
});
