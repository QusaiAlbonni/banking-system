import { INestApplication } from '@nestjs/common';
import * as env from 'env-var';

export function addCorsPolicy(app: INestApplication) {
  const allowedOrigins = env.get('ALLOWED_ORIGINS').default([]).asArray(',');
  const ao = allowedOrigins.map((o) =>
    o.trim().replace(/\/$/, '').toLowerCase(),
  );

  app.enableCors({
    origin: ao.length > 0 ? ao : undefined,
    credentials: true,
  });
}
