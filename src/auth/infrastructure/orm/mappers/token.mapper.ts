import { Token } from '@/auth/domain/token';
import { TokenEntity } from '../entities/token.entity';

export class OrmTokenMapper {
  static toDomain(raw: TokenEntity) {
    const domainEntity = new Token();
    domainEntity.id = raw.id;
    domainEntity.userId = raw.userId;
    domainEntity.token = raw.token;
    domainEntity.type = raw.type;
    domainEntity.revoked = raw.revoked;
    domainEntity.expiresAt = raw.expiresAt;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Token) {
    const entity = new TokenEntity();
    if (domainEntity.id) entity.id = domainEntity.id;
    entity.userId = domainEntity.userId;
    entity.token = domainEntity.token;
    entity.type = domainEntity.type;
    entity.revoked = domainEntity.revoked;
    entity.expiresAt = domainEntity.expiresAt;
    entity.createdAt = domainEntity.createdAt;
    entity.updatedAt = domainEntity.updatedAt;
    return entity;
  }
}
