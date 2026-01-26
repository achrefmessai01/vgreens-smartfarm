import 'dotenv/config';
import type { Express } from 'express';
import { AppModule } from '@modules/app';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GraphQLExceptionFilter } from '@common/filters';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: [
      process.env.FRONTEND_APP_URL,
      process.env.FRONTEND_PROD_APP_URL,
      'http://localhost:3000',
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'apollo-require-preflight',
      'x-client-url',
    ],
    credentials: true,
    exposedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new GraphQLExceptionFilter());

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Server running on http://0.0.0.0:${port}/graphql`);
}
bootstrap().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
