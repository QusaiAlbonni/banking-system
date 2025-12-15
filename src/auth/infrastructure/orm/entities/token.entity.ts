import { UserEntity } from '@/user/infrastructure/orm/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tokens')
export class TokenEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => UserEntity, (user) => user.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;

  @Column({
    name: 'user_id',
  })
  userId: number;

  @Column({ type: 'text' })
  token: string;

  @Column({ type: 'varchar', default: 'refresh' })
  type: string;

  @Column('timestamp', { nullable: true, default: null })
  expiresAt: Date | null;

  @Column({ default: false })
  revoked: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
