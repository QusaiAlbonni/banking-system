import { Injectable } from '@nestjs/common';
import { TransactionalContext } from '../domain/transactional-context';
import { TransactionFactory } from '../application/transaction.factory';
import { AccountFactory } from '../../account/domain/account.factory';
import { TransactionEntity } from './orm/entities/transaction.entity';
import { AccountEntity } from '../../account/infrastructure/orm/entities/account.entity';
import { AccountTransactionRepository } from '../application/account-transaction.repository';



@Injectable()
export class OrmAccountTransactionRepository implements AccountTransactionRepository {
  // db and mapper are omitted/abstracted in this minimal implementation
  constructor(
    private readonly transactionFactory: TransactionFactory,
    private readonly accountFactory: AccountFactory,
  ) {}

  async loadContext(transactionId: string): Promise<TransactionalContext> {
    const ctx = new TransactionalContext();

    const txEntity = new TransactionEntity();
    txEntity.id = transactionId;
    txEntity.amount = 0;
    txEntity.type = 'TRANSFER';
    txEntity.status = 'PENDING';
    txEntity.createdAt = new Date();
    txEntity.version = 1;
    ctx.transaction = this.transactionFactory.createFromEntity(txEntity);

    const fromEntity = new AccountEntity();
    fromEntity.id = 'from';
    fromEntity.ownerId = 'owner';
    fromEntity.accountType = 'STANDARD';
    fromEntity.isGroup = false;
    fromEntity.balance = 0;
    fromEntity.status = 'ACTIVE';
    fromEntity.createdAt = new Date();
    fromEntity.updatedAt = new Date();
    fromEntity.version = 1;

    const toEntity = { ...fromEntity, id: 'to' };

    ctx.fromAccount = this.accountFactory.createFromEntity(fromEntity);
    ctx.toAccount = this.accountFactory.createFromEntity(
      toEntity as AccountEntity,
    );

    return ctx;
  }

  async saveContext(ctx: TransactionalContext): Promise<void> {
    void ctx;
  }

  async beginTransaction(): Promise<void> {
    // start db transaction placeholder
  }

  async commit(): Promise<void> {
    // commit db transaction placeholder
  }

  async rollback(): Promise<void> {
    // rollback db transaction placeholder
  }
}
