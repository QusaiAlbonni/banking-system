import { Module } from '@nestjs/common';
import { FcmMessagingService } from './app/fcm-messaging/fcm-messaging.service';
import { FcmService } from './app/fcm.service';
import { FirebaseService } from './app/firebase/firebase.service';
import { FcmInfrastuctureModule } from './infrastucture/infrastucture.module';
import { FcmController } from './presenters/http/fcm.controller';

@Module({
  imports: [FcmInfrastuctureModule],
  exports: [FcmMessagingService, FirebaseService],
  providers: [FcmMessagingService, FirebaseService, FcmService],
  controllers: [FcmController],
})
export class FcmModule {}
