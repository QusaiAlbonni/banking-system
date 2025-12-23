import { Account } from '../account.interface';

/**
 * AccountState interface for State Pattern implementation
 * Controls whether operations are allowed based on account state
 */
export interface AccountState {
  /**
   * Attempts to deposit to the account
   * @throws {AccountStateException} if deposit is not allowed in current state
   */
  deposit(account: Account, amount: number): void;

  /**
   * Attempts to withdraw from the account
   * @throws {AccountStateException} if withdrawal is not allowed in current state
   */
  withdraw(account: Account, amount: number): void;

  /**
   * Transitions account to SUSPENDED state
   * @throws {AccountStateException} if transition is not allowed
   */
  suspend(account: Account): void;

  /**
   * Transitions account to CLOSED state
   * @throws {AccountStateException} if transition is not allowed
   */
  close(account: Account): void;

  /**
   * Gets the name of this state
   */
  getName(): string;
}

