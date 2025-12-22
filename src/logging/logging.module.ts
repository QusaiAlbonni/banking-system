import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston';
import { createWinstonLogger } from './winston';

@Global()
@Module({
  imports: [
    WinstonModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        return createWinstonLogger(configService);
      },
      imports: [ConfigModule],
      inject: [ConfigService],
    }),
  ],
})
export class LoggingModule {}
