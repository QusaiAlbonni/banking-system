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
    // ActiveState allows operations, delegate directly to strategy
    account.getDepositStrategy().deposit(account, amount);
  }

  withdraw(account: Account, amount: number): void {
    // ActiveState allows operations, delegate directly to strategy
    account.getWithdrawStrategy().withdraw(account, amount);
  }

  suspend(account: Account): void {
    account.transitionToSuspended(new SuspendedState());
  }

  close(account: Account): void {
    account.transitionToClosed(new ClosedState());
  }
}

