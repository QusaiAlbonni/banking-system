import { AccountStatus } from '../account-status.enum';
import { AccountState } from './account-state.interface';
import { ActiveState } from './active-state';
import { ClosedState } from './closed-state';
import { SuspendedState } from './suspended-state';

/**
 * Factory for creating account states based on account status
 */
export class AccountStateFactory {
  static createFromStatus(status: AccountStatus): AccountState {
    switch (status) {
      case AccountStatus.ACTIVE:
        return new ActiveState();
      case AccountStatus.SUSPENDED:
        return new SuspendedState();
      case AccountStatus.CLOSED:
        return new ClosedState();
      case AccountStatus.FROZEN:
        // For now, treat FROZEN as SUSPENDED
        // TODO: Implement FrozenState when needed
        return new SuspendedState();
      default:
        // Default to Active for unknown statuses
        return new ActiveState();
    }
  }
}

