import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Serve os arquivos salvos em ./uploads diretamente via HTTP.
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Aula 27: filtro global — intercepta erros de banco (CastError, E11000,
  // ValidationError, falha de conexão) em qualquer controller, sem precisar
  // repetir try/catch em cada método.
  app.useGlobalFilters(new MongoExceptionFilter());

  // Aula 17: documentação Swagger/OpenAPI, disponível em /docs.
  const config = new DocumentBuilder()
    .setTitle('Backend NestJS - Codificação para Back-End')
    .setDescription('API construída ao longo das aulas do curso SENAI-CRTI.')
    .setVersion('1.0')
    .addTag('produtos')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
