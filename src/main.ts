import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOriginsEnv = process.env.CORS_ORIGINS?.trim();
  const isProd = process.env.NODE_ENV === 'production';
  const corsOrigins = corsOriginsEnv
    ? corsOriginsEnv.split(',').map((s) => s.trim()).filter(Boolean)
    : !isProd
      ? ['http://localhost:5173', 'http://127.0.0.1:5173']
      : undefined;
  if (corsOrigins?.length) {
    app.enableCors({ origin: corsOrigins, credentials: true });
  }

  app.use(express.json({ limit: '5mb' }));
  app.use(express.urlencoded({ extended: true, limit: '5mb' }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Web-proj API')
    .setDescription('REST API for quizzes platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  instance.use(
    express.static(join(__dirname, '..', 'frontend', 'dist')),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Application is running on port ${port}`);
}
bootstrap();
