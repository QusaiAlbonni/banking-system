import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Cache } from 'cache-manager';

@Injectable()
export class JwtBlacklistGuard extends AuthGuard('jwt') {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {
    super();
  }

  // after passport validated token and set request.user, we check blacklist
  async canActivate(context: ExecutionContext) {
    // run passport's jwt strategy first
    const activated = (await super.canActivate(context)) as boolean;
    if (!activated) return false;

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers['authorization'] || '';
    const accessToken =
      (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader) ||
      req.body?.accessToken;

    if (accessToken) {
      const isBlacklisted = await this.cacheManager.get(
        `bl:access:${accessToken}`,
      );
      if (isBlacklisted) {
        throw new UnauthorizedException('Token revoked');
      }
    }
    return true;
  }
}
