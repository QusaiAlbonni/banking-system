import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class RefreshTokenGuard extends AuthGuard('refresh-jwt') {
  handleRequest(err, user, info, context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    user.rawRefreshToken = req.body.refreshToken;
    return user;
  }
}
