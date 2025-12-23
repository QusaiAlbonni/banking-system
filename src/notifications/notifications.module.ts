import { MessagingModule } from '@/messaging/messaging.module';
import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationEntity } from './entities/notification.entity';
import { UserModule } from '@/user/user.module';

@Module({
  controllers: [NotificationsController],
  imports: [
    MessagingModule,
    TypeOrmModule.forFeature([NotificationEntity]),
    UserModule,
  ],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
