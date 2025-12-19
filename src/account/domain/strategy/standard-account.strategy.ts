import {
  DepositStrategy,
  WithdrawStrategy,
  Account,
} from '../account.interface';
import { AccountStatus } from '../account-status.enum';
import { IndividualAccount } from '../account';
import {
  STANDARD_MIN_BALANCE,
  STANDARD_MAX_WITHDRAWAL,
  STANDARD_MAX_DEPOSIT,
} from './strategy.constants';

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

  withdraw(account: Account, amount: number): boolean {
    if (amount <= 0 || !Number.isFinite(amount)) {
      return false;
    }

    // Check transaction limit if configured
    if (this.maxWithdrawal !== undefined && amount > this.maxWithdrawal) {
      return false;
    }

    account.decreaseBalance(amount);
    account.updatedAt = new Date();
    const withdrawalCount =
      parseInt(account.metadata.withdrawalCount || '0', 10) + 1;
    account.metadata.withdrawalCount = withdrawalCount.toString();
    account.metadata.lastWithdrawal = new Date().toISOString();
    return true;
  }

  deposit(account: Account, amount: number): boolean {
    if (amount <= 0 || !Number.isFinite(amount)) {
      return false;
    }

    // Check transaction limit if configured
    if (this.maxDeposit !== undefined && amount > this.maxDeposit) {
      return false;
    }

    account.increaseBalance(amount);
    account.updatedAt = new Date();
    const depositCount = parseInt(account.metadata.depositCount || '0', 10) + 1;
    account.metadata.depositCount = depositCount.toString();
    account.metadata.lastDeposit = new Date().toISOString();
    return true;
  }
}
