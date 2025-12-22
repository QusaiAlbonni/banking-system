import { DeviceType } from '@/messaging/fcm/domain/enums/device-type';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FcmDeviceResponseDto {
  @Expose()
  id: number;

  @Expose()
  type: DeviceType;

  @Expose()
  registrationId: string;

  @Expose()
  active: boolean;

  @Expose()
  userId: number;

  @Expose()
  createdAt: Date;
}
