import { ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class OptionalOpaqueAuthGuard extends AuthGuard('optional-opaque') {
  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): any {
    if (err) throw err;

    return user;
  }
}
