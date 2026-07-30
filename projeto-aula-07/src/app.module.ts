import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConvidadosController } from './convidados/convidados.controller';

@Module({
  imports: [],
  controllers: [AppController, ConvidadosController],
  providers: [AppService],
})
export class AppModule {}
