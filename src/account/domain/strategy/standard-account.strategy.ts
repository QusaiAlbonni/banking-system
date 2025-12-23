import {
  InvalidTransactionAmountException,
  TransactionLimitExceededException,
} from '../../application/account.exceptions';
import {
  Account,
  DepositStrategy,
  WithdrawStrategy,
} from '../account.interface';

/**
 * Standard account strategy with balance checks, transaction limits, and minimum balance enforcement
 */
export class StandardAccountStrategy
  implements WithdrawStrategy, DepositStrategy
{
  constructor(
    private readonly maxWithdrawal?: number,
    private readonly maxDeposit?: number,
  ) {}

  withdraw(account: Account, amount: number): void {
    if (amount <= 0 || !Number.isFinite(amount)) {
      throw new InvalidTransactionAmountException(account.id, amount, 'Amount must be greater than 0 and finite');
    }

    // Check transaction limit if configured
    if (this.maxWithdrawal !== undefined && amount > this.maxWithdrawal) {
      throw new TransactionLimitExceededException(account.id, amount, this.maxWithdrawal, 'withdraw');
    }

    account.decreaseBalance(amount);
    account.updatedAt = new Date();
    const withdrawalCount =
      parseInt(account.metadata.withdrawalCount || '0', 10) + 1;
    account.metadata.withdrawalCount = withdrawalCount.toString();
    account.metadata.lastWithdrawal = new Date().toISOString();
  }

  deposit(account: Account, amount: number): void {
    if (amount <= 0 || !Number.isFinite(amount)) {
   
      throw new InvalidTransactionAmountException(account.id, amount, 'Amount must be greater than 0 and finite');
    }

    // Check transaction limit if configured
    if (this.maxDeposit !== undefined && amount > this.maxDeposit) {
      throw new TransactionLimitExceededException(account.id, amount, this.maxDeposit, 'deposit');
    }

    account.increaseBalance(amount);
    account.updatedAt = new Date();
    const depositCount = parseInt(account.metadata.depositCount || '0', 10) + 1;
    account.metadata.depositCount = depositCount.toString();
    account.metadata.lastDeposit = new Date().toISOString();
  }
}
