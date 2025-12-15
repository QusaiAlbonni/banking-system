import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import * as path from 'path';
import { DataSource } from 'typeorm';

config();

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: configService.get<string>('DATABASE_URL'),
  entities: [__dirname + '/../**/*.entity.{js,ts}'],
  migrations: [path.join(__dirname, './migrations/*.ts')],
  migrationsRun: true,
  logging: true,
  maxQueryExecutionTime: 1000000000,
});
