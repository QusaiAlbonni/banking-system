import { AccountNotActiveException } from '../../application/account.exceptions';
import { AccountStatus } from '../account-status.enum';
import { Account } from '../account.interface';
import { AccountState } from './account-state.interface';
import { ClosedState } from './closed-state';

/**
 * SuspendedState - blocks all operations (deposit, withdraw)
 * Can transition to CLOSED, cannot transition back to ACTIVE directly
 */
export class SuspendedState implements AccountState {
  getName(): string {
    return AccountStatus.SUSPENDED;
  }

  deposit(account: Account, amount: number): void {
    throw new AccountNotActiveException(
      account.id,
      AccountStatus.SUSPENDED,
      'deposit',
    );
  }

  withdraw(account: Account, amount: number): void {
    throw new AccountNotActiveException(
      account.id,
      AccountStatus.SUSPENDED,
      'withdraw',
    );
  }

  suspend(account: Account): void {
    // Already suspended, no-op
  }

  close(account: Account): void {
    // Suspended accounts can be closed
    account.status = AccountStatus.CLOSED;
    account['currentState'] = new ClosedState();
    account.updatedAt = new Date();
  }
}

