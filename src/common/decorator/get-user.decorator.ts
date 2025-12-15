import { AuthenticatedUser } from '@/auth/domain/authenticated-user';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (
    data: keyof AuthenticatedUser | string | undefined,
    context: ExecutionContext,
  ): any => {
    const request = context.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser;

    if (!user) return null;

    return data ? user[data] : user;
  },
);
