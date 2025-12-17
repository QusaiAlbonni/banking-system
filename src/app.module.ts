/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { seconds, ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ConfigModule } from './config/config.module';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import { EmailModule } from './email/email.module';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { I18nTranslationFilter } from './translations/translations.filter';
import { CacheModule } from '@nestjs/cache-manager';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            ttl: seconds(0.5),
            limit: 1,
          },
        ],
      }),
    }),
    DatabaseModule,
    AuthModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      resolvers: [AcceptLanguageResolver],
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
      },
    }),
    ConfigModule,
    CacheModule.register({
      isGlobal: true,
      ttl: 300000,
    }),
    EmailModule,
    UserModule,
    CoreModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: I18nTranslationFilter
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
