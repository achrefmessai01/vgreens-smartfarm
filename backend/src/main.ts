import 'dotenv/config';
import type { Express } from 'express';
import { AppModule } from '@modules/app';
import { NestFactory } from '@nestjs/core';
import { graphqlUploadExpress } from 'graphql-upload-ts';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('ValidationPipe');

  app.enableCors({
    origin: [
      process.env.FRONTEND_APP_URL,
      process.env.FRONTEND_PROD_APP_URL,
      'http://localhost:3000',
      'http://localhost:8081',
      'https://embeddable-sandbox.netlify.app',
      'https://studio.apollographql.com',
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-client-url',
      'apollo-require-preflight',
    ],
    credentials: true,
    exposedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors) => {
        const messages = errors.map((error) => ({
          property: error.property,
          constraints: error.constraints ?? {},
          children:
            error.children?.map((child) => ({
              property: child.property,
              constraints: child.constraints ?? {},
            })) ?? [],
        }));

        // Log validation errors
        logger.error(`Validation failed with ${messages.length} error(s):`);
        messages.forEach((error, index) => {
          logger.error(
            `[${index + 1}] ${error.property}: ${Object.values(
              error.constraints || {},
            ).join(', ')} (value: ${JSON.stringify(error)})`,
          );
        });

        return new BadRequestException({
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  app.use(
    graphqlUploadExpress({
      maxFileSize: 10_000_000,
      maxFiles: 10,
    }),
  );

  const expressApp = app.getHttpAdapter().getInstance() as Express;
  expressApp.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });

  await app.listen(process.env.PORT || 8080, '0.0.0.0');
  console.log(`Server is running on port ${process.env.PORT || 8080}`);
}

bootstrap().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
