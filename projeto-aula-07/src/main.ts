import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { join } from 'path';
import { AppModule } from './app.module';
import { MongoExceptionFilter } from './common/filters/mongo-exception.filter';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Aula 34: Atividade Prática - "Blindagem de API".
  // Uma linha ativa X-DNS-Prefetch-Control, X-Frame-Options (anti-clickjacking),
  // remove o header X-Powered-By, entre outros headers de segurança padrão.
  app.use(helmet());

  // Sem options: nenhum DTO existente (Convidados, Produtos, Categorias etc.)
  // usa decorators do class-validator, então eles continuam passando direto
  // — só os campos decorados (por enquanto, LoginDto e ValidarUsuarioDto)
  // passam a ser validados de verdade. whitelist/forbidNonWhitelisted não
  // foram ligados de propósito: ligar isso globalmente apagaria em silêncio
  // o corpo de todo DTO ainda não decorado.
  app.useGlobalPipes(new ValidationPipe());

  // Serve os arquivos salvos em ./uploads diretamente via HTTP.
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Aula 27: filtro global — intercepta erros de banco (CastError, E11000,
  // ValidationError, falha de conexão) em qualquer controller, sem precisar
  // repetir try/catch em cada método.
  // Aula 39: ordem AQUI É AO CONTRÁRIO do que parece — internamente o Nest
  // faz filters.reverse() antes de testá-los (RouterExceptionFilters.create,
  // @nestjs/core), então o ÚLTIMO filtro passado para useGlobalFilters() é o
  // PRIMEIRO a ser tentado. AllExceptionsFilter usa @Catch() sem argumentos
  // (bate com QUALQUER exceção), então se ele viesse primeiro na lista,
  // engoliria até os erros de banco antes do MongoExceptionFilter ver
  // algo — foi exatamente o que aconteceu na primeira tentativa (Cast
  // Error de Mongoose caindo no filtro genérico). AllExceptionsFilter
  // precisa vir PRIMEIRO aqui para acabar rodando POR ÚLTIMO de verdade.
  app.useGlobalFilters(new AllExceptionsFilter(), new MongoExceptionFilter());

  // Aula 17: documentação Swagger/OpenAPI, disponível em /docs.
  // Aula 31: addBearerAuth() habilita o botão "Authorize" no Swagger UI,
  // necessário para testar rotas protegidas por JwtAuthGuard (ex.: /produtos).
  const config = new DocumentBuilder()
    .setTitle('Backend NestJS - Codificação para Back-End')
    .setDescription('API construída ao longo das aulas do curso SENAI-CRTI.')
    .setVersion('1.0')
    .addTag('produtos')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
