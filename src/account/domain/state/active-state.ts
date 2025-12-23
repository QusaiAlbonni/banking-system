import { AccountStatus } from '../account-status.enum';
import { Account } from '../account.interface';
import { AccountState } from './account-state.interface';
import { ClosedState } from './closed-state';
import { SuspendedState } from './suspended-state';

/**
 * ActiveState - allows all operations (deposit, withdraw)
 * Can transition to SUSPENDED or CLOSED
 * Delegates to strategies which throw domain exceptions on violations
 */
export class ActiveState implements AccountState {
  getName(): string {
    return AccountStatus.ACTIVE;
  }

  deposit(account: Account, amount: number): void {
    // Active state allows deposits - delegate to strategy
    // State validation passed, strategy will handle business rules and throw exceptions if violated
    account['depositStrategy'].deposit(account, amount); 
  }

  withdraw(account: Account, amount: number): void {
    // Active state allows withdrawals - delegate to strategy
    // State validation passed, strategy will handle business rules and throw exceptions if violated
    account['withdrawStrategy'].withdraw(account, amount);
  }

  suspend(account: Account): void {
    // Active accounts can be suspended
    account.status = AccountStatus.SUSPENDED;
    account['currentState'] = new SuspendedState();
    account.updatedAt = new Date();
  }

  close(account: Account): void {
    // Active accounts can be closed
    account.status = AccountStatus.CLOSED;
    account['currentState'] = new ClosedState();
    account.updatedAt = new Date();
  }
}

