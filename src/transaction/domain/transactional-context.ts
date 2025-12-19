import { Transaction } from './transaction';
import { Account } from '../../account/domain/account.interface';

export class TransactionalContext {
  transaction!: Transaction;
  fromAccount?: Account;
  toAccount?: Account;
  // dbSession is kept as unknown to avoid coupling to a specific ORM here.
  dbSession?: unknown;
  isNewTransaction = false;

  getTransaction(): Transaction {
    return this.transaction;
  }

  getFromAccount(): Account | undefined {
    return this.fromAccount;
  }

  getToAccount(): Account | undefined {
    return this.toAccount;
  }

  markDirty(): void {
    // placeholder to mark unit-of-work as dirty
  }
}
