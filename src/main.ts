import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { I18nMiddleware, I18nModule, I18nValidationException, I18nValidationPipe } from 'nestjs-i18n';
import { addCorsPolicy } from './cors';
import helmet from 'helmet';
import { buildSwaggerDocument } from './swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      whitelist: true,
    })
  )
  addCorsPolicy(app);
  app.use(I18nMiddleware);
  app.use(helmet());
  buildSwaggerDocument(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
