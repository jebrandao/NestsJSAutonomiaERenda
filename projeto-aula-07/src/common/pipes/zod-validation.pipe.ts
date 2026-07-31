import { BadRequestException, PipeTransform } from '@nestjs/common';
import type { ZodType } from 'zod';

// Aula 16: Pipe reutilizável — recebe qualquer schema Zod e valida o valor
// (tipicamente o @Body()) antes que ele chegue ao Controller.
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown) {
    const resultado = this.schema.safeParse(value);

    if (!resultado.success) {
      const erros = resultado.error.issues.map((issue) => ({
        campo: issue.path.join('.'),
        mensagem: issue.message,
      }));
      throw new BadRequestException(erros);
    }

    return resultado.data;
  }
}
