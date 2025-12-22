/* eslint-disable prettier/prettier */
import { AccountEntity } from '@/account/infrastructure/orm/entities/account.entity';
import { TokenEntity } from '@/auth/infrastructure/orm/entities/token.entity';
import { Role } from '@/user/domain/role';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name', type: 'varchar', length: 50 })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', length: 50, nullable: true })
  lastName: string;

  @Column({ name: 'email', type: 'varchar', length: 50 })
  @Index({ unique: true })
  email: string;

  @Column({ name: 'phone', type: 'varchar', length: 25, unique: true })
  @Index({ unique: true })
  phone: string;

  @Column({ name: 'password', type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'is_active', type: 'boolean', default: false })
  isActive: boolean;

  @Column({ name: 'must_change_password', type: 'boolean', default: false })
  mustChangePassword: boolean;

  @Column({
    name: 'role',
    type: 'enum',
    enum: Role,
    default: 'user' as Role,
  })
  role: Role;

  @OneToMany(() => TokenEntity, (t) => t.user)
  tokens: TokenEntity[];

  @OneToMany(() => AccountEntity, (ae) => ae.owner)
  accounts?: AccountEntity[];


  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;


  @BeforeInsert()
  activateAdmins() {
    if (this.isAdminUser) {
      this.isActive = true;
      this.mustChangePassword = false;
    }
  }


  get fullName() {
    return this.firstName + ' ' + this.lastName;
  }

  get isUser(): boolean {
    return this.role === Role.USER;
  }
  get isManagerUser(): boolean {
    return this.role === Role.MANAGER;
  }
  get isTellerUser(): boolean {
    return this.role === Role.TELLER;
  }
  get isAdminUser(): boolean {
    return this.role === Role.ADMIN;
  }

}
