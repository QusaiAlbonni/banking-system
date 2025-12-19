import { WithdrawStrategy, Account } from '../account.interface';

/**
 * Strategy that explicitly denies all withdrawal attempts
 * Used for accounts like loan accounts, fee accounts, etc.
 */
export class NoWithdrawStrategy implements WithdrawStrategy {
  withdraw(account: Account, amount: number): boolean {
    // Explicitly deny all withdrawal attempts
    // Could log this attempt for audit purposes
    if (account.metadata) {
      account.metadata.lastWithdrawalAttempt = new Date().toISOString();
      account.metadata.lastWithdrawalAttemptAmount = amount.toString();
      account.metadata.lastWithdrawalAttemptStatus = 'DENIED';
    }
    return false;
  }
}

