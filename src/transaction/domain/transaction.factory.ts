import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { TransactionEntity } from '../infrastructure/orm/entities/transaction.entity';
import { Transaction } from './transaction';
import {
  TransactionStatus,
  TransactionType,
} from './transaction.enums';

@Injectable()
export class TransactionFactory {
  createFromEntity(entity: TransactionEntity): Transaction {
    const tx = new Transaction();
    tx.id = entity.id;
    tx.fromAccountId = entity.fromAccountId;
    tx.toAccountId = entity.toAccountId;
    tx.type = entity.type as TransactionType;
    tx.amount = entity.amount;
    tx.status = entity.status as TransactionStatus;
    tx.createdAt = entity.createdAt;
    tx.executedAt = entity.executedAt;
    return tx;
  }

  newTransaction(
    type: TransactionType,
    amount: number,
    fromAccountId?: string,
    toAccountId?: string,
  ): Transaction {
    const entity = new TransactionEntity();
    entity.id = randomUUID();
    entity.type = type;
    entity.amount = amount;
    entity.fromAccountId = fromAccountId;
    entity.toAccountId = toAccountId;
    entity.status = TransactionStatus.PENDING;
    entity.createdAt = new Date();
    return this.createFromEntity(entity);
  }

  toEntity(domain: Transaction): TransactionEntity {
    const entity = new TransactionEntity();
    entity.id = domain.id;
    entity.fromAccountId = domain.fromAccountId;
    entity.toAccountId = domain.toAccountId;
    entity.type = domain.type;
    entity.amount = domain.amount;
    entity.status = domain.status;
    entity.createdAt = domain.createdAt;
    entity.executedAt = domain.executedAt;
    return entity;
  }
}
