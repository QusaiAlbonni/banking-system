import { FCMDevice } from '../../domain/device';
import { DeviceType } from '../../domain/enums/device-type';

export abstract class FcmDeviceRepository {
  abstract findOneByRegistrationId(
    registrationId: string,
    userId?: number,
  ): Promise<FCMDevice | null>;
  abstract findByUserIds(ids: number[]): Promise<FCMDevice[]>;
  abstract create(device: {
    registrationId: string;
    userId: number;
    type: DeviceType;
  }): Promise<FCMDevice>;
  abstract update(device: FCMDevice): Promise<FCMDevice>;
  abstract remove(device: FCMDevice): Promise<void>;
}
