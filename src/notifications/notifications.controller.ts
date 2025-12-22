import { FullUrl, GetUser } from '@/common/decorator';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { NotificationQueryDto } from './dto';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ActiveGuard, JwtGuard, OpaqueAuthGuard } from '@/auth/guard';
import { NotificationsService } from './notifications.service';
import { Roles } from '@/auth/presenter/decorator';
import { Role } from '@/user/domain/role';

@UseGuards(ThrottlerGuard, JwtGuard, ActiveGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifService: NotificationsService) {}
  @Get()
  async getAll(
    @GetUser('id') userId: number,
    @Query() query: NotificationQueryDto,
    @FullUrl() url: string,
  ) {
    return this.notifService.getUsersNotifications(userId, query, url);
  }
}
