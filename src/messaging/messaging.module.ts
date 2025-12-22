import { Module } from '@nestjs/common';
import { FcmMessagingService } from './fcm/app/fcm-messaging/fcm-messaging.service';
import { FcmModule } from './fcm/fcm.module';
import { MessagingService } from './messaging.service';
import { MockMessagingService } from './test/mock/mock-messaging.service';

@Module({
  providers: [
    MockMessagingService,
    {
      provide: MessagingService,
      useExisting: MockMessagingService,
    },
  ],
  exports: [MessagingService],
  imports: [FcmModule],
})
export class MessagingModule {}
