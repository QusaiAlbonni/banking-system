import { TransactionType } from './transaction.enums';

export class TransactionFailedEvent {
  constructor(
    public readonly transactionId: string,
    public readonly type: TransactionType,
    public readonly amount: number,
    public readonly reason: string,
    public readonly fromAccountId?: string,
    public readonly toAccountId?: string,
  ) {}
}

