import { AccountStatus } from './account-status.enum';
import { AccountType } from './account-type.enum';
import { DepositStrategy } from './strategy/deposit.strategy';
import { InterestStrategy } from './strategy/interest.strategy';
import { WithdrawStrategy } from './strategy/withdraw.strategy';

export interface Withdrawable {
  withdraw(amount: number): boolean;
}

export interface Depositable {
  deposit(amount: number): boolean;
}

export abstract class Account implements Withdrawable, Depositable {
  id!: string;
  ownerId!: number;
  status!: AccountStatus;
  type: AccountType;
  createdAt!: Date;
  updatedAt!: Date;
  metadata: Record<string, string> = {};

  protected withdrawStrategy!: WithdrawStrategy;
  protected depositStrategy!: DepositStrategy;

  protected interestStrategy!: InterestStrategy;

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

  getInterest(amount: number){
    return this.interestStrategy.calculate(amount);
  }

  abstract decreaseBalance(amount: number): void;
  abstract increaseBalance(amount: number): void;
}


