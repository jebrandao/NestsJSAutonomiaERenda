import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
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
import { Categoria, CategoriaSchema } from './categorias/schemas/categoria.schema';

@Module({
  imports: [
    // Aula 18: variáveis de ambiente disponíveis em toda a aplicação.
    ConfigModule.forRoot({ isGlobal: true }),
    // Aula 19: conexão com o MongoDB gerenciada pelo Nest (substitui o
    // mongoose.connect() manual chamado antes diretamente em main.ts).
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
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
    MongooseModule.forFeature([{ name: Categoria.name, schema: CategoriaSchema }]),
  ],
  controllers: [AppController, ConvidadosController, LivrosController, MediaController, SegurancaController, AdminController, ProdutosController, ColaboradoresController, CategoriasController],
  providers: [AppService, ConvidadosService, LivrosService, ProdutosService, CategoriasService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicado a todas as rotas da aplicação, como pede a atividade.
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
