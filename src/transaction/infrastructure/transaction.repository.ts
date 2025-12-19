import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../domain/transaction';
import { TransactionEntity } from './orm/entities/transaction.entity';
import { TransactionFactory } from '../application/transaction.factory';

export interface TransactionRepository {
  getTransaction(id: string): Promise<Transaction | null>;
  save(transaction: Transaction): Promise<void>;
}

@Injectable()
export class OrmTransactionRepository implements TransactionRepository {
  constructor(
    private readonly factory: TransactionFactory,
    @InjectRepository(TransactionEntity)
    private readonly repo: Repository<TransactionEntity>,
  ) {}

  async getTransaction(id: string): Promise<Transaction | null> {
    const entity = await this.repo.findOne({ where: { id } });
    if (!entity) return null;
    return this.factory.createFromEntity(entity);
  }

  async save(transaction: Transaction): Promise<void> {
    const entity = new TransactionEntity();
    entity.id = transaction.id;
    entity.amount = transaction.amount;
    entity.type = transaction.type;
    entity.status = transaction.status;
    entity.fromAccountId = transaction.fromAccountId;
    entity.toAccountId = transaction.toAccountId;
    entity.createdAt = transaction.createdAt;
    entity.executedAt = transaction.executedAt;
    entity.version = transaction.version;
    await this.repo.save(entity);
  }
}
