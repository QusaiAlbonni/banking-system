/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { UserService } from '@/user/application/services/user.service';
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class ActiveGuard implements CanActivate {
  constructor(private readonly usrService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user: any = request.user;

    if (!user) {
      return true;
    }

    if (user.isActive === undefined || user.isActive === null) {
      const temp = await this.usrService.findOne(user.id);
      user.isActive = temp?.isActive;
    }

    if (!user.isActive) {
      throw new ForbiddenException('User Account is not Active.');
    }

    return true;
  }
}
