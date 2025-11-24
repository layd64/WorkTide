import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

import * as fs from 'fs';

async function bootstrap() {
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
  }
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:5173', // Vite's default port
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.use((req, res, next) => {
    res.charset = 'utf-8';
    res.setHeader('Content-Type', res.getHeader('Content-Type') || 'application/json; charset=utf-8');
    next();
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  logger.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
