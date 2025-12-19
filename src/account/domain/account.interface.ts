import { AccountStatus } from './account-status.enum';

export interface Withdrawable {
  withdraw(amount: number): boolean;
}

export interface Depositable {
  deposit(amount: number): boolean;
}

export interface WithdrawStrategy {
  withdraw(account: Account, amount: number): boolean;
}

export interface DepositStrategy {
  deposit(account: Account, amount: number): boolean;
}

export abstract class Account implements Withdrawable, Depositable {
  id!: string;
  ownerId!: string;
  status!: AccountStatus;
  createdAt!: Date;
  updatedAt!: Date;
  metadata: Record<string, string> = {};

  protected withdrawStrategy!: WithdrawStrategy;
  protected depositStrategy!: DepositStrategy;

  abstract getBalance(): number;

  withdraw(amount: number): boolean {
    if (!this.withdrawStrategy) {
      return false;
    }
    return this.withdrawStrategy.withdraw(this, amount);
  }

  deposit(amount: number): boolean {
    if (!this.depositStrategy) {
      return false;
    }
    return this.depositStrategy.deposit(this, amount);
  }

  abstract decreaseBalance(amount: number): void;
  abstract increaseBalance(amount: number): void;
}


