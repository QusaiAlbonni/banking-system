import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  BaseEntity,
  CreateDateColumn,
} from 'typeorm';
import { DeviceType } from '../../domain/enums/device-type';
import { UserEntity } from '@/user/infrastructure/orm/entities/user.entity';

@Entity('fcm_devices')
@Index('idx_fcm_device_user', ['user'])
export class FCMDeviceEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: DeviceType,
    default: DeviceType.ANDROID,
  })
  type: DeviceType;

  @Column({
    name: 'registration_id',
    type: 'varchar',
    length: 255,
    unique: true,
  })
  registrationId: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @ManyToOne(() => UserEntity, (user) => user.devices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: UserEntity | null;

  @Column({ name: 'user_id' })
  userId: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  getRegistrationId(): string {
    return this.registrationId;
  }
}
