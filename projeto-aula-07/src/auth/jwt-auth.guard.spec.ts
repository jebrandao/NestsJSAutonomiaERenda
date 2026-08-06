import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  it('should be defined', () => {
    expect(new JwtAuthGuard()).toBeDefined();
  });

  // Aula 31: garante que continua ativando a estratégia 'jwt' do Passport
  // (o AuthGuard nativo faz toda a validação — nada é reimplementado aqui).
  it('deve estender o AuthGuard da estratégia jwt', () => {
    expect(new JwtAuthGuard()).toBeInstanceOf(AuthGuard('jwt'));
  });
});
