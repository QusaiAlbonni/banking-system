import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  I18nMiddleware,
  I18nModule,
  I18nValidationException,
  I18nValidationPipe,
} from 'nestjs-i18n';
import { addCorsPolicy } from './cors';
import helmet from 'helmet';
import { buildSwaggerDocument } from './swagger';
import * as nunjucks from 'nunjucks';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new I18nValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  addCorsPolicy(app);
  nunjucks.configure('views', {
    autoescape: true,
    express: app,
    watch: true,
  });
  app.setViewEngine('njk');
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.use(I18nMiddleware);
  app.use(helmet());
  app.use(compression());

  buildSwaggerDocument(app);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
