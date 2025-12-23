import { DeviceType } from '@/messaging/fcm/domain/enums/device-type';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateFcmDto {
  @IsString()
  @IsOptional()
  registrationId?: string;

  @IsEnum(DeviceType)
  @IsOptional()
  type?: DeviceType;
}
