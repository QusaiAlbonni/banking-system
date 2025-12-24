/**
 * Domain exceptions for transaction operations
 */
export class TransactionDomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionDomainException';
  }
}

export class InvalidTransactionStateException extends TransactionDomainException {
  constructor(currentStatus: string, expectedStatus: string) {
    super(
      `Transaction is not in ${expectedStatus} status. Current status: ${currentStatus}`,
    );
    this.name = 'InvalidTransactionStateException';
  }
}

export class InvalidTransactionAmountException extends TransactionDomainException {
  constructor(amount: number) {
    super(`Invalid transaction amount: ${amount}. Amount must be greater than 0.`);
    this.name = 'InvalidTransactionAmountException';
  }
}

export class AccountRequiredException extends TransactionDomainException {
  constructor(accountType: 'source' | 'target') {
    super(
      `${accountType === 'source' ? 'Source' : 'Target'} account is required for this transaction`,
    );
    this.name = 'AccountRequiredException';
  }
}

export class AccountNotActiveException extends TransactionDomainException {
  constructor(accountId: string, status: string) {
    super(
      `Account ${accountId} is not active. Current status: ${status}. Only ACTIVE accounts can perform transactions.`,
    );
    this.name = 'AccountNotActiveException';
  }
}

export class InsufficientFundsException extends TransactionDomainException {
  constructor(accountId: string, balance: number, requestedAmount: number) {
    super(
      `Insufficient funds in account ${accountId}. Balance: ${balance}, Requested: ${requestedAmount}`,
    );
    this.name = 'InsufficientFundsException';
  }
}

export class TransactionExecutionException extends TransactionDomainException {
  constructor(transactionId: string, reason: string) {
    super(`Transaction ${transactionId} execution failed: ${reason}`);
    this.name = 'TransactionExecutionException';
  }
}

export class UnauthorizedAccountAccessException extends TransactionDomainException {
  constructor(accountId: string, userId: number) {
    super(
      `User ${userId} does not have access to account ${accountId}. Account does not belong to the user.`,
    );
    this.name = 'UnauthorizedAccountAccessException';
  }
}

export class SameAccountTransferException extends TransactionDomainException {
  constructor(accountId: string) {
    super(
      `Cannot transfer to the same account ${accountId}. Source and target accounts must be different.`,
    );
    this.name = 'SameAccountTransferException';
  }
}

