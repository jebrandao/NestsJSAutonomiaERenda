import { BadRequestException } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from './zod-validation.pipe';

describe('ZodValidationPipe', () => {
  const schema = z.object({
    nome: z.string().min(3, "O campo 'nome' deve ter no mínimo 3 letras"),
    idade: z.number().min(18, "O campo 'idade' deve ser no mínimo 18"),
  });
  const pipe = new ZodValidationPipe(schema);

  it('deve retornar os dados quando são válidos', () => {
    const dados = { nome: 'Ana', idade: 30 };
    expect(pipe.transform(dados)).toEqual(dados);
  });

  it('deve lançar BadRequestException quando os dados são inválidos', () => {
    expect(() => pipe.transform({ nome: 'An', idade: 10 })).toThrow(BadRequestException);
  });

  it('deve incluir campo e mensagem de cada erro encontrado', () => {
    try {
      pipe.transform({ nome: 'An', idade: 10 });
      fail('deveria ter lançado uma exceção');
    } catch (error) {
      const resposta = (error as BadRequestException).getResponse() as {
        message: { campo: string; mensagem: string }[];
      };
      expect(resposta.message).toEqual([
        { campo: 'nome', mensagem: "O campo 'nome' deve ter no mínimo 3 letras" },
        { campo: 'idade', mensagem: "O campo 'idade' deve ser no mínimo 18" },
      ]);
    }
  });
});
