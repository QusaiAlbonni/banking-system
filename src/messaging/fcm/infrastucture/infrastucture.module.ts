import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FcmDeviceRepository } from '../app/ports/fcm-device.repository';
import { FCMDeviceEntity } from './entities/device.entity';
import { OrmFcmDeviceRepository } from './repositories/orm-fcm-device.repository';

@Module({
  imports: [TypeOrmModule.forFeature([FCMDeviceEntity])],
  providers: [
    {
      provide: FcmDeviceRepository,
      useClass: OrmFcmDeviceRepository,
    },
    OrmFcmDeviceRepository,
  ],
  exports: [FcmDeviceRepository],
})
export class FcmInfrastuctureModule {}
