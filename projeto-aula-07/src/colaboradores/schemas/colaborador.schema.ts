import { z } from 'zod';

// Aula 16: Atividade Prática - "O Validador de RH".
export const colaboradorSchema = z.object({
  nome: z.string().min(3, "O campo 'nome' deve ter no mínimo 3 letras"),
  email: z.string().email("O campo 'email' deve ter um formato válido"),
  idade: z
    .number()
    .min(18, "O campo 'idade' deve ser no mínimo 18")
    .max(65, "O campo 'idade' deve ser no máximo 65"),
  departamento: z.enum(['TI', 'RH', 'Vendas'], {
    error: "O campo 'departamento' deve ser 'TI', 'RH' ou 'Vendas'",
  }),
});

// Tipo TypeScript inferido diretamente do schema — uma única fonte da verdade.
export type CreateColaboradorDto = z.infer<typeof colaboradorSchema>;
