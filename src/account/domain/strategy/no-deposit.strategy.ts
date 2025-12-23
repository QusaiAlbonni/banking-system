import { Account } from '../account.interface';
import { DepositStrategy } from './deposit.strategy';
import { DepositNotAllowedException } from '../../application/account.exceptions';

/**
 * Strategy that explicitly denies all deposit attempts
 * Used for special account types that don't accept deposits
 */
export class NoDepositStrategy implements DepositStrategy {
  deposit(account: Account, amount: number): void {
    // Log this attempt for audit purposes
    if (account.metadata) {
      account.metadata.lastDepositAttempt = new Date().toISOString();
      account.metadata.lastDepositAttemptAmount = amount.toString();
      account.metadata.lastDepositAttemptStatus = 'DENIED';
    }
    throw new DepositNotAllowedException(account.id, account.type, 'Account type does not allow deposits');
  }
}

