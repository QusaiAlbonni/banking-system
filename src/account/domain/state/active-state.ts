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
    account.deposit(amount); 
  }

  withdraw(account: Account, amount: number): void {
    account.withdraw(amount);
  }

  suspend(account: Account): void {
    account.status = AccountStatus.SUSPENDED;
    account.currentState = new SuspendedState();
    account.updatedAt = new Date();
  }

  close(account: Account): void {
    account.status = AccountStatus.CLOSED;
    account.currentState = new ClosedState();
    account.updatedAt = new Date();
  }
}

