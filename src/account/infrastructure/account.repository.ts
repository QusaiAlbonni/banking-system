import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../domain/account.interface';
import { AccountEntity } from './orm/entities/account.entity';
import { AccountFactory } from '../domain/account.factory';
import { AccountType } from '../domain/account-type.enum';
import { AccountRepository } from '../application/account.repository';

@Injectable()
export class OrmAccountRepository implements AccountRepository {
  constructor(
    private readonly accountFactory: AccountFactory,
    @InjectRepository(AccountEntity)
    private readonly repo: Repository<AccountEntity>,
  ) {}

  async getAccount(id: string): Promise<Account | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['groupMembers'],
    });
    if (!entity) return null;
    return this.accountFactory.createFromEntity(entity);
  }

  async save(account: Account): Promise<void> {
    // use factory mapping so mapping rules are centralized
    const accountEntity = this.accountFactory.toEntity(
      account,
    );
    await this.repo.save(accountEntity);
  }
}
