import { AuthGuard } from '@nestjs/passport';
import { JwtRefreshAuthGuard } from './jwt-refresh-auth.guard';

describe('JwtRefreshAuthGuard', () => {
  it('should be defined', () => {
    expect(new JwtRefreshAuthGuard()).toBeDefined();
  });

  it('deve estender o AuthGuard da estratégia jwt-refresh', () => {
    expect(new JwtRefreshAuthGuard()).toBeInstanceOf(AuthGuard('jwt-refresh'));
  });
});
