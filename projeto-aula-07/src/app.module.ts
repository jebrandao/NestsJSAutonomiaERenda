import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvidadosController } from './convidados/convidados.controller';
import { ConvidadosService } from './convidados/convidados.service';

@Module({
  imports: [],
  controllers: [AppController, ConvidadosController],
  providers: [AppService, ConvidadosService],
})
export class AppModule {}
