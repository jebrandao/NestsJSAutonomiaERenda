import { JwtStrategy } from './jwt.strategy';
import { Role } from './role.enum';

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
  // Aula 32: roles também precisa passar adiante para o RolesGuard funcionar.
  it('validate deve mapear sub/email/roles do payload para userId/email/roles', () => {
    const resultado = strategy.validate({
      sub: 'abc123',
      email: 'ana@empresa.com',
      roles: [Role.ADMIN],
    });

    expect(resultado).toEqual({
      userId: 'abc123',
      email: 'ana@empresa.com',
      roles: [Role.ADMIN],
    });
  });
});
