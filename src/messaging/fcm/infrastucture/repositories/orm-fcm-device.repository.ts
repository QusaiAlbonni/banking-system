import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FcmDeviceRepository } from '../../app/ports/fcm-device.repository';
import { FCMDevice } from '../../domain/device';
import { DeviceType } from '../../domain/enums/device-type';
import { FCMDeviceEntity } from '../entities/device.entity';
import { FCMDeviceMapper } from '../mappers/fcm-device.mapper';

export class OrmFcmDeviceRepository implements FcmDeviceRepository {
  constructor(
    @InjectRepository(FCMDeviceEntity)
    private readonly fcmRepo: Repository<FCMDeviceEntity>,
  ) {}
  async findByUserIds(ids: number[]): Promise<FCMDevice[]> {
    const entities = await this.fcmRepo.findBy({ userId: In(ids) });

    return entities.map((e) => FCMDeviceMapper.toDomain(e));
  }

  async findOneByRegistrationId(
    registrationId: string,
    userId?: number,
  ): Promise<FCMDevice | null> {
    const entity = await this.fcmRepo.findOneBy({ registrationId, userId });
    if (!entity) return null;

    return FCMDeviceMapper.toDomain(entity);
  }

  async create(device: {
    registrationId: string;
    userId: number;
    type: DeviceType;
  }): Promise<FCMDevice> {
    const created = this.fcmRepo.create({
      registrationId: device.registrationId,
      userId: device.userId,
      type: device.type,
    });

    const saved = await this.fcmRepo.save(created);
    return FCMDeviceMapper.toDomain(saved);
  }

  async update(device: FCMDevice): Promise<FCMDevice> {
    const entity = FCMDeviceMapper.toPersistence(device);
    const saved = await this.fcmRepo.save(entity);
    return FCMDeviceMapper.toDomain(saved);
  }

  async remove(device: FCMDevice): Promise<void> {
    const entity = FCMDeviceMapper.toPersistence(device);
    await this.fcmRepo.remove(entity);
  }
}
