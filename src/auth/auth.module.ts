import { EmailModule } from '@/email/email.module';
import { UserModule } from '@/user/user.module';
import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import type { StringValue } from 'ms';
import { AuthService } from './application/services/auth.service';
import { OtpService } from './application/services/otp.service';
import { TokenService } from './application/services/token.service';
import { AuthInfraStructureModule } from './infrastructure/infrastructure.module';
import { AuthController } from './presenter/http/auth.controller';
import { JwtStrategy } from './strategy/jwt.strategy';
import { RefreshTokenStrategy } from './strategy/refresh-token.strategy';
import { AuthViewsController } from './presenter/http/pages/auth-views.controller';
@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const expiresIn = (configService.get<string>('JWT_EXPIRES_IN') ||
          '1h') as StringValue;
        return {
          secret: configService.get<string>('JWT_SECRET') || '',
          signOptions: {
            expiresIn,
          },
        };
      },
      global: true,
      inject: [ConfigService],
    }),
    forwardRef(() => TypeOrmModule),
    forwardRef(() => UserModule),
    AuthInfraStructureModule,
    EmailModule,
  ],
  providers: [
    AuthService,
    TokenService,
    JwtStrategy,
    RefreshTokenStrategy,
    OtpService,
  ],
  controllers: [AuthController, AuthViewsController],
  exports: [AuthService, TokenService],
})
export class AuthModule {}
