import { User } from '@/user/domain/user';
import { UserEntity } from '../entities/user.entity';

export class OrmUserMapper {
  static toDomain(raw: UserEntity) {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.firstName = raw.firstName;
    domainEntity.lastName = raw.lastName ?? null;
    domainEntity.email = raw.email;
    domainEntity.phone = raw.phone;
    domainEntity.password = raw.password;
    domainEntity.isActive = raw.isActive;
    domainEntity.mustChangePassword = raw.mustChangePassword;
    domainEntity.role = raw.role;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: User) {
    const persistenceEntity = new UserEntity();
    persistenceEntity.id = domainEntity.id;
    persistenceEntity.firstName = domainEntity.firstName;
    persistenceEntity.lastName = domainEntity.lastName;
    persistenceEntity.email = domainEntity.email;
    persistenceEntity.phone = domainEntity.phone;
    persistenceEntity.password = domainEntity.password;
    persistenceEntity.role = domainEntity.role;
    persistenceEntity.isActive = domainEntity.isActive;
    persistenceEntity.mustChangePassword = domainEntity.mustChangePassword;
    if (domainEntity.createdAt)
      persistenceEntity.createdAt = domainEntity.createdAt;
    if (domainEntity.updatedAt)
      persistenceEntity.updatedAt = domainEntity.updatedAt;
    return persistenceEntity;
  }
}
