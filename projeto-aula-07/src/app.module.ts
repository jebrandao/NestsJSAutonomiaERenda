import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
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

@Module({
  imports: [],
  controllers: [AppController, ConvidadosController, LivrosController, MediaController, SegurancaController, AdminController, ProdutosController],
  providers: [AppService, ConvidadosService, LivrosService, ProdutosService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Aplicado a todas as rotas da aplicação, como pede a atividade.
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
