import { TokenRepository } from '@/auth/application/ports/token.repository';
import { Token } from '@/auth/domain/token';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenEntity } from '../entities/token.entity';
import { OrmTokenMapper } from '../mappers/token.mapper';

@Injectable()
export class OrmTokenRepository extends TokenRepository {
  constructor(
    @InjectRepository(TokenEntity)
    private readonly tokenRepo: Repository<TokenEntity>,
  ) {
    super();
  }

  async create(
    userId: number,
    token: string,
    type: string,
    expiresAt: Date | null,
  ) {
    const tokens = this.tokenRepo.create({
      userId,
      token,
      type,
      expiresAt,
    });
    const t = await this.tokenRepo.save(tokens);
    return OrmTokenMapper.toDomain(t);
  }

  async findByToken(token: string): Promise<Token | null> {
    const entity = await this.tokenRepo.findOne({
      where: { token },
      relations: ['user'],
    });
    return entity ? OrmTokenMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<Token[]> {
    const entities = await this.tokenRepo.find({
      where: { userId },
      relations: ['user'],
    });
    return entities.map(OrmTokenMapper.toDomain);
  }

  async revokeToken(id: number): Promise<void> {
    await this.tokenRepo.update(id, { revoked: true });
  }

  async revokeTokensForUser(userId: number, type: string): Promise<void> {
    await this.tokenRepo.update(
      { userId, type, revoked: false },
      { revoked: true },
    );
  }

  async deleteExpiredTokens(): Promise<void> {
    await this.tokenRepo
      .createQueryBuilder()
      .delete()
      .where('expiresAt < :now', { now: new Date() })
      .execute();
  }
}
