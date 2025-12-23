import { User } from '@/user/domain/user';
import { DeviceType } from './enums/device-type';

export class FCMDevice {
  id: number;
  type: DeviceType;
  registrationId: string;
  active: boolean;
  user?: User | null;
  userId: number;
  createdAt: Date;
}
