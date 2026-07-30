import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvidadosController } from './convidados/convidados.controller';
import { ConvidadosService } from './convidados/convidados.service';
import { LivrosController } from './livros/livros.controller';
import { LivrosService } from './livros/livros.service';

@Module({
  imports: [],
  controllers: [AppController, ConvidadosController, LivrosController],
  providers: [AppService, ConvidadosService, LivrosService],
})
export class AppModule {}
