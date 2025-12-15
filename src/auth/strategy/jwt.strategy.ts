import { Role } from '@/user/domain/role';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { AuthenticatedUser } from '../domain/authenticated-user';
import { AuthJwtPayload } from '@/common/types/auth-jwtPayload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(cfg: ConfigService) {
    const secret = cfg.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    const opts: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    };

    super(opts);
  }
  validate(payload: AuthJwtPayload): AuthenticatedUser {
    const user = new AuthenticatedUser();
    user.id = payload.sub;
    user.email = payload.email;
    user.role = payload.role as Role;
    return user;
  }
}
