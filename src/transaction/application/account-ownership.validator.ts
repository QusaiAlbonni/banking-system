import { Account } from '@/account/domain/account.interface';
import { UnauthorizedAccountAccessException } from './transaction.exceptions';

/**
 * Validates account ownership
 */
export class AccountOwnershipValidator {
  /**
   * Validates that the account belongs to the specified user
   * @param account - The account to validate
   * @param userId - The user ID to check ownership against
   * @throws {UnauthorizedAccountAccessException} if account does not belong to user
   */
  static validateOwnership(account: Account, userId: number): void {
    if (!account) {
      throw new Error('Account is required for ownership validation');
    }

    if (account.ownerId !== userId) {
      throw new UnauthorizedAccountAccessException(account.id, userId);
    }
  }

  /**
   * Validates that both accounts belong to the specified user (for transfers)
   * @param fromAccount - The source account
   * @param toAccount - The target account
   * @param userId - The user ID to check ownership against
   * @throws {UnauthorizedAccountAccessException} if any account does not belong to user
   */
  static validateOwnershipForTransfer(
    fromAccount: Account,
    toAccount: Account,
    userId: number,
  ): void {
    this.validateOwnership(fromAccount, userId);
    this.validateOwnership(toAccount, userId);
  }
}

