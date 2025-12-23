import { AccountStatus } from './account-status.enum';
import { AccountType } from './account-type.enum';
import { InterestStrategy } from './strategy/interest.strategy';
import { AccountState } from './state/account-state.interface';

export interface Withdrawable {
  withdraw(amount: number): void;
}

export interface Depositable {
  deposit(amount: number): void;
}

export interface WithdrawStrategy {
  withdraw(account: Account, amount: number): void;
}

export interface DepositStrategy {
  deposit(account: Account, amount: number): void;
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
  currentState!: AccountState;

  protected interestStrategy!: InterestStrategy;

  abstract getBalance(): number;

  /**
   * Withdraws from the account
   * Delegates to current state which validates state and then executes strategy
   * @throws {AccountStateException} if state doesn't allow withdrawal
   * @throws {AccountStrategyException} if strategy rejects the operation
   */
  withdraw(amount: number): void {
    if (!this.currentState) {
      throw new Error('Account state is not initialized');
    }
    this.currentState.withdraw(this, amount);
  }

  /**
   * Deposits to the account
   * Delegates to current state which validates state and then executes strategy
   * @throws {AccountStateException} if state doesn't allow deposit
   * @throws {AccountStrategyException} if strategy rejects the operation
   */
  deposit(amount: number): void {
    if (!this.currentState) {
      throw new Error('Account state is not initialized');
    }
    this.currentState.deposit(this, amount);
  }

  /**
   * Suspends the account
   * @throws {AccountStateException} if transition is not allowed
   */
  suspend(): void {
    if (!this.currentState) {
      throw new Error('Account state is not initialized');
    }
    this.currentState.suspend(this);
  }

  /**
   * Closes the account
   * @throws {AccountStateException} if transition is not allowed
   */
  close(): void {
    if (!this.currentState) {
      throw new Error('Account state is not initialized');
    }
    this.currentState.close(this);
  }

  getInterest(amount: number){
    return this.interestStrategy.calculate(amount);
  }

  abstract decreaseBalance(amount: number): void;
  abstract increaseBalance(amount: number): void;
}


