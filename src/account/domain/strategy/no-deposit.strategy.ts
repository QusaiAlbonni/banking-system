import { DepositStrategy, Account } from '../account.interface';

/**
 * Strategy that explicitly denies all deposit attempts
 * Used for special account types that don't accept deposits
 */
export class NoDepositStrategy implements DepositStrategy {
  deposit(account: Account, amount: number): boolean {
    // Explicitly deny all deposit attempts
    // Could log this attempt for audit purposes
    if (account.metadata) {
      account.metadata.lastDepositAttempt = new Date().toISOString();
      account.metadata.lastDepositAttemptAmount = amount.toString();
      account.metadata.lastDepositAttemptStatus = 'DENIED';
    }
    return false;
  }
}

