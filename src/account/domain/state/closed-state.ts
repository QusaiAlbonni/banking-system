import { AccountClosedException, InvalidAccountStateTransitionException } from '../../application/account.exceptions';
import { AccountStatus } from '../account-status.enum';
import { Account } from '../account.interface';
import { AccountState } from './account-state.interface';

/**
 * ClosedState - blocks all operations (deposit, withdraw)
 * Cannot transition to any other state (terminal state)
 */
export class ClosedState implements AccountState {
  getName(): string {
    return AccountStatus.CLOSED;
  }

  deposit(account: Account, amount: number): void {
    throw new AccountClosedException(account.id, 'deposit');
  }

  withdraw(account: Account, amount: number): void {
    throw new AccountClosedException(account.id, 'withdraw');
  }

  suspend(account: Account): void {
    throw new InvalidAccountStateTransitionException(
      account.id,
      AccountStatus.CLOSED,
      AccountStatus.SUSPENDED,
    );
  }

  close(account: Account): void {
    // Already closed, no-op
    // Could throw exception if we want to enforce idempotency strictly
  }
}

