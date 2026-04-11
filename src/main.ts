import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import * as express from 'express';
import { join } from 'path';
import { UserFilter } from './user/user.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentation User Management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const docs = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, docs);
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));
  const logger = app.get(WINSTON_MODULE_NEST_PROVIDER);
  app.useGlobalFilters(new UserFilter());
  app.useLogger(logger);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
