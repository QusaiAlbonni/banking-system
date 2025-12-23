import { DeviceType } from '@/messaging/fcm/domain/enums/device-type';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class CreateFcmDto {
  @IsString()
  @IsNotEmpty()
  registrationId: string;

  @IsEnum(DeviceType)
  type: DeviceType;
}
