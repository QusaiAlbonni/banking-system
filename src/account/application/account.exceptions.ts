/**
 * Domain exceptions for account state operations
 */
export class AccountStateException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountStateException';
  }
}

export class AccountNotActiveException extends AccountStateException {
  constructor(accountId: string, currentStatus: string, operation: string) {
    super(
      `Cannot ${operation} on account ${accountId}. Account is ${currentStatus}. Only ACTIVE accounts can perform ${operation} operations.`,
    );
    this.name = 'AccountNotActiveException';
  }
}

export class AccountClosedException extends AccountStateException {
  constructor(accountId: string, operation: string) {
    super(
      `Cannot ${operation} on account ${accountId}. Account is CLOSED and does not allow any operations.`,
    );
    this.name = 'AccountClosedException';
  }
}

export class InvalidAccountStateTransitionException extends AccountStateException {
  constructor(accountId: string, currentStatus: string, targetStatus: string) {
    super(
      `Cannot transition account ${accountId} from ${currentStatus} to ${targetStatus}. Invalid state transition.`,
    );
    this.name = 'InvalidAccountStateTransitionException';
  }
}

/**
 * Domain exceptions for account strategy operations
 */
export class AccountStrategyException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AccountStrategyException';
  }
}

export class WithdrawalNotAllowedException extends AccountStrategyException {
  constructor(accountId: string, accountType: string, reason?: string) {
    const message = reason
      ? `Withdrawal not allowed on ${accountType} account ${accountId}: ${reason}`
      : `Withdrawal not allowed on ${accountType} account ${accountId}`;
    super(message);
    this.name = 'WithdrawalNotAllowedException';
  }
}

export class DepositNotAllowedException extends AccountStrategyException {
  constructor(accountId: string, accountType: string, reason?: string) {
    const message = reason
      ? `Deposit not allowed on ${accountType} account ${accountId}: ${reason}`
      : `Deposit not allowed on ${accountType} account ${accountId}`;
    super(message);
    this.name = 'DepositNotAllowedException';
  }
}

export class InvalidTransactionAmountException extends AccountStrategyException {
  constructor(accountId: string, amount: number, reason?: string) {
    const message = reason
      ? `Invalid transaction amount ${amount} for account ${accountId}: ${reason}`
      : `Invalid transaction amount ${amount} for account ${accountId}. Amount must be greater than 0.`;
    super(message);
    this.name = 'InvalidTransactionAmountException';
  }
}

export class TransactionLimitExceededException extends AccountStrategyException {
  constructor(accountId: string, amount: number, limit: number, operation: 'deposit' | 'withdraw') {
    super(
      `${operation.charAt(0).toUpperCase() + operation.slice(1)} amount ${amount} exceeds limit of ${limit} for account ${accountId}`,
    );
    this.name = 'TransactionLimitExceededException';
  }
}

export class MinimumPaymentRequiredException extends AccountStrategyException {
  constructor(accountId: string, amount: number, minimumPayment: number) {
    super(
      `Deposit amount ${amount} is less than minimum payment ${minimumPayment} required for account ${accountId}`,
    );
    this.name = 'MinimumPaymentRequiredException';
  }
}

