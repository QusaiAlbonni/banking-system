import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../domain/transaction';
import { TransactionFactory } from '../domain/transaction.factory';
import { TransactionEntity } from './orm/entities/transaction.entity';
import { TransactionRepository } from '../application/account-transaction.repository';



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
    // Check if transaction exists
    const existing = await this.repo.findOne({ where: { id: transaction.id } });
    
    if (existing) {
      // Update existing transaction
      existing.amount = transaction.amount;
      existing.type = transaction.type;
      existing.status = transaction.status;
      existing.fromAccountId = transaction.fromAccountId;
      existing.toAccountId = transaction.toAccountId;
      existing.executedAt = transaction.executedAt;
      // Version is managed by TypeORM
      await this.repo.save(existing);
    } else {
      // Create new transaction
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
}
