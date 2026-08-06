import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    const configService = {
      get: jest.fn().mockReturnValue('segredo-de-teste'),
    };
    strategy = new JwtStrategy(configService as never);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  // Aula 31: o retorno de validate() vira req.user nos controllers.
  it('validate deve mapear sub/email do payload para userId/email', () => {
    const resultado = strategy.validate({
      sub: 'abc123',
      email: 'ana@empresa.com',
    });

    expect(resultado).toEqual({ userId: 'abc123', email: 'ana@empresa.com' });
  });
});
