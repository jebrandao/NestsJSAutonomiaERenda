// Aula 14: função simples apresentada pelo instrutor.
// Formato compatível com Vercel Serverless Functions (Node.js runtime):
// qualquer arquivo dentro de /api que exporte um handler(req, res)
// vira automaticamente uma rota serverless quando implantado na Vercel.
export default function handler(req, res) {
  res.status(200).json({
    hora: new Date().toISOString(),
    localizacaoServidor: process.env.VERCEL_REGION || 'local (sem deploy)',
  });
}
