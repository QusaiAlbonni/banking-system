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
    tx.version = entity.version;
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
    entity.version = 1;
    return this.createFromEntity(entity);
  }
}
