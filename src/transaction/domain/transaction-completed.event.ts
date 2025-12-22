import { TransactionType } from './transaction.enums';

export class TransactionCompletedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly fromAccountId?: string,
    public readonly toAccountId?: string,
    public readonly executedAt: Date = new Date(),
  ) {}
}

