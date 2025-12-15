import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function buildSwaggerDocument(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Banking API')
    .setDescription('Banking API documentation')
    .setVersion('0.2.2')
    .addBearerAuth()
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'Bearer',
        in: 'header',
      },
      'bearer',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);
  app.use('api-json', (req, res) => res.json(documentFactory()));
}

export * from './decorator';
