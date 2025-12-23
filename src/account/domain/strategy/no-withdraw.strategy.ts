import { Account } from '../account.interface';
import { WithdrawStrategy } from './withdraw.strategy';
import { WithdrawalNotAllowedException } from '../../application/account.exceptions';


/**
 * Strategy that explicitly denies all withdrawal attempts
 * Used for accounts like loan accounts, fee accounts, etc.
 */
export class NoWithdrawStrategy implements WithdrawStrategy {
  withdraw(account: Account, amount: number): void {
    // Log this attempt for audit purposes
    if (account.metadata) {
      account.metadata.lastWithdrawalAttempt = new Date().toISOString();
      account.metadata.lastWithdrawalAttemptAmount = amount.toString();
      account.metadata.lastWithdrawalAttemptStatus = 'DENIED';
    }
    throw new WithdrawalNotAllowedException(account.id, account.type, 'Account type does not allow withdrawals');
  }
}

