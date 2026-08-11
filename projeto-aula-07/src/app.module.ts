import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { rateLimit } from 'express-rate-limit';
import type { Connection } from 'mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvidadosController } from './convidados/convidados.controller';
import { ConvidadosService } from './convidados/convidados.service';
import { LivrosController } from './livros/livros.controller';
import { LivrosService } from './livros/livros.service';
import { MediaController } from './media/media.controller';
import { SegurancaController } from './seguranca/seguranca.controller';
import { AdminController } from './admin/admin.controller';
import { LoggerMiddleware } from './logger/logger.middleware';
import { ProdutosController } from './produtos/produtos.controller';
import { ProdutosService } from './produtos/produtos.service';
import { ColaboradoresController } from './colaboradores/colaboradores.controller';
import { Produto, ProdutoSchema } from './produtos/schemas/produto.schema';
import { CategoriasController } from './categorias/categorias.controller';
import { CategoriasService } from './categorias/categorias.service';
import {
  Categoria,
  CategoriaSchema,
} from './categorias/schemas/categoria.schema';
import { UsuariosController } from './usuarios/usuarios.controller';
import { UsuariosService } from './usuarios/usuarios.service';
import { Usuario, UsuarioSchema } from './usuarios/schemas/usuario.schema';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { JwtRefreshStrategy } from './auth/jwt-refresh.strategy';
import { AuditoriaPerfilMiddleware } from './usuarios/auditoria-perfil.middleware';
import { StatusController } from './status/status.controller';

@Module({
  imports: [
    // Aula 18: variáveis de ambiente disponíveis em toda a aplicação.
    // Aula 36: qual arquivo .env carregar depende do NODE_ENV — o mesmo
    // princípio Twelve-Factor App de "código idêntico entre ambientes,
    // só a configuração muda". NODE_ENV precisa estar definido no shell
    // ANTES de subir o processo (ex.: NODE_ENV=production node dist/main.js),
    // porque o ConfigModule lê esse valor no boot, antes mesmo de o .env
    // correspondente ser carregado.
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath:
        process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),
    // Aula 19: conexão com o MongoDB gerenciada pelo Nest (substitui o
    // mongoose.connect() manual chamado antes diretamente em main.ts).
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('DATABASE_URL'),
        // Sem isso, cada tentativa demora até 30s (padrão do driver) e o
        // @nestjs/mongoose ainda tenta de novo 9 vezes por padrão — o erro
        // levaria minutos para aparecer no terminal. 3s deixa o retry rápido.
        serverSelectionTimeoutMS: 3000,
        // O @nestjs/mongoose cria a conexão com mongoose.createConnection(),
        // uma instância isolada — os eventos NÃO disparam em mongoose.connection
        // (a conexão global). onConnectionCreate dá acesso à conexão real usada.
        onConnectionCreate: (connection: Connection) => {
          connection.on('connected', () => {
            console.log('Mongoose conectado ao MongoDB com sucesso!');
          });
          connection.on('error', (error: Error) => {
            console.error('Erro na conexão do Mongoose:', error.message);
          });
          connection.on('disconnected', () => {
            console.warn('Mongoose desconectado do MongoDB.');
          });
          return connection;
        },
      }),
      inject: [ConfigService],
    }),
    // Aula 20: registra o Schema/Model de Produto no escopo da aplicação.
    MongooseModule.forFeature([{ name: Produto.name, schema: ProdutoSchema }]),
    // Aula 25: registra o Schema/Model de Categoria (relacionamento com Produto).
    MongooseModule.forFeature([
      { name: Categoria.name, schema: CategoriaSchema },
    ]),
    // Aula 26: registra o Schema/Model de Usuario (hook pre-save de bcrypt).
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    // Aula 30: JWT_SECRET vem do .env via ConfigService, nunca hardcoded —
    // mesmo padrão já usado para o DATABASE_URL (MongooseModule acima).
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
    // Aula 31: registra a estratégia 'jwt' no Passport para o AuthGuard('jwt')
    // (usado pelo JwtAuthGuard) conseguir localizá-la.
    PassportModule,
  ],
  controllers: [
    AppController,
    ConvidadosController,
    LivrosController,
    MediaController,
    SegurancaController,
    AdminController,
    ProdutosController,
    ColaboradoresController,
    CategoriasController,
    UsuariosController,
    AuthController,
    StatusController,
  ],
  providers: [
    AppService,
    ConvidadosService,
    LivrosService,
    ProdutosService,
    CategoriasService,
    UsuariosService,
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicado a todas as rotas da aplicação, como pede a atividade.
    consumer.apply(LoggerMiddleware).forRoutes('*');

    // Aula 34: Atividade Prática - "Blindagem de API".
    // /auth/login é o alvo clássico de força bruta — 10 tentativas por
    // minuto por IP é suficiente para um usuário legítimo errar a senha
    // algumas vezes, mas inviabiliza testar senhas em massa.
    consumer
      .apply(
        rateLimit({
          windowMs: 60 * 1000,
          max: 10,
          standardHeaders: true,
          legacyHeaders: false,
          message: {
            message:
              'Muitas tentativas de login. Tente novamente em instantes.',
          },
        }),
      )
      .forRoutes('auth/login');

    // Aula 35: Atividade Prática - "Auditoria LGPD".
    // Só GET (visualização de perfil) — PATCH/DELETE em usuarios/:id não
    // são "acesso ao perfil" no sentido de leitura que a atividade pede.
    consumer
      .apply(AuditoriaPerfilMiddleware)
      .forRoutes({ path: 'usuarios/:id', method: RequestMethod.GET });
  }
}
