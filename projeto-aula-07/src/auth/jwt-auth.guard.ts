import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// Aula 31: Atividade Prática - "Acesso Restrito ao Inventário".
// AuthGuard('jwt') é o guarda nativo do Passport que ativa a JwtStrategy
// registrada acima — validação de assinatura/expiração automática, sem
// lógica extra aqui.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
