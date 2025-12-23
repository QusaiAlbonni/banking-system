import {
  AccountClosedException,
  InvalidTransactionAmountException as AccountInvalidTransactionAmountException,
  AccountStateException,
  AccountNotActiveException as AccountStateNotActiveException,
  AccountStrategyException,
  DepositNotAllowedException,
  InvalidAccountStateTransitionException,
  MinimumPaymentRequiredException,
  TransactionLimitExceededException,
  WithdrawalNotAllowedException,
} from '@/account/application/account.exceptions';
import { Account } from '@/account/domain/account.interface';
import { AggregateRoot } from '@nestjs/cqrs';
import {
  AccountRequiredException,
  InsufficientFundsException,
  InvalidTransactionAmountException,
  InvalidTransactionStateException,
  TransactionExecutionException,
} from '../application/transaction.exceptions';
import { TransactionCompletedEvent } from './transaction-completed.event';
import { TransactionFailedEvent } from './transaction-failed.event';
import { TransactionStatus, TransactionType } from './transaction.enums';

export interface Operation {
  execute(): boolean;
}

export class Transaction extends AggregateRoot implements Operation {
  id!: string;
  fromAccountId?: string;
  toAccountId?: string;
  type!: TransactionType;
  amount!: number;
  status!: TransactionStatus;
  createdAt!: Date;
  executedAt?: Date;
  version!: number;

  /**
   * Validates the transaction state before execution
   * @throws {InvalidTransactionStateException} if transaction is not in PENDING status
   * @throws {InvalidTransactionAmountException} if amount is invalid
   */
  validateState(): void {
    if (this.status !== TransactionStatus.PENDING) {
      throw new InvalidTransactionStateException(
        this.status,
        TransactionStatus.PENDING,
      );
    }
    if (this.amount <= 0 || !Number.isFinite(this.amount)) {
      throw new InvalidTransactionAmountException(this.amount);
    }
  }

  /**
   * Executes the transaction based on its type
   * Uses State Pattern and Strategy Pattern via Account aggregate for deposit/withdraw operations
   * State validation is handled by Account via State Pattern
   * Strategy validation is handled by Account strategies
   * @throws {TransactionDomainException} if validation or execution fails
   */
  execute(fromAccount?: Account, toAccount?: Account): boolean {
    try {
      // Validate transaction state
      this.validateState();

      switch (this.type) {
        case TransactionType.DEPOSIT:
          this.executeDeposit(toAccount);
          break;
        case TransactionType.WITHDRAW:
          this.executeWithdraw(fromAccount);
          break;
        case TransactionType.TRANSFER:
          this.executeTransfer(fromAccount, toAccount);
          break;
        default:
          throw new TransactionExecutionException(
            this.id,
            `Unknown transaction type: ${this.type}`,
          );
      }

      this.status = TransactionStatus.COMPLETED;
      this.executedAt = new Date();
      this.apply(
        new TransactionCompletedEvent(
          this.id,
          this.type,
          this.amount,
          this.fromAccountId,
          this.toAccountId,
          this.executedAt,
        ),
      );
      return true;
    } catch (error) {
      this.status = TransactionStatus.FAILED;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      this.apply(
        new TransactionFailedEvent(
          this.id,
          this.type,
          this.amount,
          errorMessage,
          this.fromAccountId,
          this.toAccountId,
        ),
      );
      // Re-throw domain exceptions (both transaction and account domain exceptions)
      if (
        error instanceof InvalidTransactionStateException ||
        error instanceof InvalidTransactionAmountException ||
        error instanceof AccountRequiredException ||
        error instanceof InsufficientFundsException ||
        error instanceof TransactionExecutionException ||
        error instanceof AccountStateException ||
        error instanceof AccountStrategyException ||
        error instanceof AccountStateNotActiveException ||
        error instanceof AccountClosedException ||
        error instanceof InvalidAccountStateTransitionException ||
        error instanceof WithdrawalNotAllowedException ||
        error instanceof DepositNotAllowedException ||
        error instanceof AccountInvalidTransactionAmountException ||
        error instanceof TransactionLimitExceededException ||
        error instanceof MinimumPaymentRequiredException
      ) {
        throw error;
      }
      // For unexpected errors, still throw but mark as failed
      throw error;
    }
  }

  /**
   * Executes a deposit operation
   * State validation is handled by Account via State Pattern
   * Strategy validation is handled by Account strategies
   * @throws {AccountRequiredException} if target account is missing
   * @throws {AccountStateException} if account state doesn't allow deposit
   * @throws {AccountStrategyException} if strategy rejects the deposit
   */
  private executeDeposit(toAccount?: Account): void {
    if (!toAccount) {
      throw new AccountRequiredException('target');
    }
    // State and strategy validation handled by Account.deposit()
    toAccount.deposit(this.amount);
  }

  /**
   * Executes a withdrawal operation
   * State validation is handled by Account via State Pattern
   * Strategy validation is handled by Account strategies
   * @throws {AccountRequiredException} if source account is missing
   * @throws {InsufficientFundsException} if account has insufficient funds
   * @throws {AccountStateException} if account state doesn't allow withdrawal
   * @throws {AccountStrategyException} if strategy rejects the withdrawal
   */
  private executeWithdraw(fromAccount?: Account): void {
    if (!fromAccount) {
      throw new AccountRequiredException('source');
    }
    
    // Check balance before withdrawal
    const balance = fromAccount.getBalance();
    if (balance < this.amount) {
      throw new InsufficientFundsException(
        fromAccount.id,
        balance,
        this.amount,
      );
    }
    
    // State and strategy validation handled by Account.withdraw()
    fromAccount.withdraw(this.amount);
  }

  /**
   * Executes a transfer operation
   * State validation is handled by Account via State Pattern
   * Strategy validation is handled by Account strategies
   * @throws {AccountRequiredException} if accounts are missing
   * @throws {InsufficientFundsException} if source account has insufficient funds
   * @throws {AccountStateException} if account states don't allow operations
   * @throws {AccountStrategyException} if strategies reject the operations
   * @throws {TransactionExecutionException} if rollback fails
   */
  private executeTransfer(
    fromAccount?: Account,
    toAccount?: Account,
  ): void {
    if (!fromAccount) {
      throw new AccountRequiredException('source');
    }
    if (!toAccount) {
      throw new AccountRequiredException('target');
    }
    
    // Check balance before transfer
    const balance = fromAccount.getBalance();
    if (balance < this.amount) {
      throw new InsufficientFundsException(
        fromAccount.id,
        balance,
        this.amount,
      );
    }
    
    // First withdraw from source (state and strategy validation handled by Account)
    try {
      fromAccount.withdraw(this.amount);
    } catch (error) {
      // If withdrawal fails, throw immediately (no rollback needed)
      throw error;
    }
    
    // Then deposit to target (state and strategy validation handled by Account)
    try {
      toAccount.deposit(this.amount);
    } catch (error) {
      // If deposit fails, attempt rollback
      try {
        fromAccount.deposit(this.amount);
      } catch (rollbackError) {
        throw new TransactionExecutionException(
          this.id,
          'Transfer failed and rollback also failed. Manual intervention required.',
        );
      }
      throw new TransactionExecutionException(
        this.id,
        'Deposit to target account failed. Amount has been rolled back to source account.',
      );
    }
  }
}


