import { OrmUserMapper } from '@/user/infrastructure/orm/mappers/user.mapper';
import { FCMDevice } from '../../domain/device';
import { FCMDeviceEntity } from '../entities/device.entity';

export class FCMDeviceMapper {
  static toDomain(entity: FCMDeviceEntity): FCMDevice {
    return {
      id: entity.id,
      type: entity.type,
      registrationId: entity.registrationId,
      active: entity.active,
      user: entity.user ? OrmUserMapper.toDomain(entity.user) : undefined,
      userId: entity.userId,
      createdAt: entity.createdAt,
    };
  }

  static toPersistence(domain: FCMDevice): FCMDeviceEntity {
    const entity = new FCMDeviceEntity();

    entity.id = domain.id;
    entity.type = domain.type;
    entity.registrationId = domain.registrationId;
    entity.active = domain.active;
    entity.user = domain.user
      ? OrmUserMapper.toPersistence(domain.user)
      : undefined;
    entity.userId = domain.userId;
    entity.createdAt = domain.createdAt;

    return entity;
  }
}
