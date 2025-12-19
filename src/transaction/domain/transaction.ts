import { Account } from '@/account/domain/account.interface';
import { TransactionStatus, TransactionType } from './transaction.enums';
import { AggregateRoot } from '@nestjs/cqrs';

export interface Operation {
  execute(): boolean;
}

export class Transaction extends AggregateRoot implements Operation {
  id!: string;
  fromAccountId?: string;
  toAccountId?: string;
  type!: TransactionType;
  amount!: number;
  status!: TransactionStatus;
  createdAt!: Date;
  executedAt?: Date;
  version!: number;

  execute(fromAccount?: Account, toAccount?: Account): boolean {
    // domain logic placeholder
    // here you should:
    // execute based on the transaction type: deposit, withdraw, transfer (which is both deposit and transfer)
    // apply a domain event with .apply()
    this.status = TransactionStatus.COMPLETED;
    this.executedAt = new Date();
    return true;
  }
}


