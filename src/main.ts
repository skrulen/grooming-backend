import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin:['http://localhost:3001'],
    credentials: true,
    exposedHeaders: 'set-cookie',
  })
  app.setGlobalPrefix('api');
  await app.listen(3000);
}

bootstrap();
