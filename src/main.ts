import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  await app.listen(process.env.PORT || 4000);
  app.use(bodyParser.raw({ type: 'application/octet-stream', limit: '50mb' }));
}
bootstrap();
