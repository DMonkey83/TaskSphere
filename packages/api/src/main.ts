import fs from 'fs';
import path from 'path';

import { NestFactory } from '@nestjs/core';
import cookiesParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  console.log(
    'Resolved key path:',
    path.resolve(__dirname, '../../../../../certs/cert.key'),
  );

  const httpsOptions = {
    key: fs.readFileSync(
      path.resolve(__dirname, '../../../../../certs/cert.key'),
    ),
    cert: fs.readFileSync(
      path.resolve(__dirname, '../../../../../certs/cert.pem'),
    ),
  };
  const app = await NestFactory.create(AppModule, { httpsOptions });
  app.use(cookiesParser());

  app.enableCors({
    origin: 'https://localhost:3001',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    exposedHeaders: ['Set-Cookie'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
