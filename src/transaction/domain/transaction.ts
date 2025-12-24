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
  SameAccountTransferException,
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
        error instanceof MinimumPaymentRequiredException ||
        error instanceof SameAccountTransferException
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
   * Strategy validation (including balance checks) is handled by Account strategies
   * @throws {AccountRequiredException} if source account is missing
   * @throws {InsufficientFundsException} if account has insufficient funds (from strategy)
   * @throws {AccountStateException} if account state doesn't allow withdrawal
   * @throws {AccountStrategyException} if strategy rejects the withdrawal
   */
  private executeWithdraw(fromAccount?: Account): void {
    if (!fromAccount) {
      throw new AccountRequiredException('source');
    }
    
    // State and strategy validation (including balance checks) handled by Account.withdraw()
    fromAccount.withdraw(this.amount);
  }

  /**
   * Executes a transfer operation using a compensating transaction pattern
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
    
    // Enforce transfer invariant: fromAccount ≠ toAccount
    if (fromAccount.id === toAccount.id) {
      throw new SameAccountTransferException(fromAccount.id);
    }
    
    // Track execution state for compensating transaction
    let withdrawalCompleted = false;
    
    try {
      // Step 1: Withdraw from source (state and strategy validation, including balance checks, handled by Account)
      fromAccount.withdraw(this.amount);
      withdrawalCompleted = true;
      
      // Step 2: Deposit to target (state and strategy validation handled by Account)
      toAccount.deposit(this.amount);
      
      // Transfer completed successfully
    } catch (error) {
      // Compensating transaction: rollback withdrawal if it was completed
      if (withdrawalCompleted) {
        try {
          // Compensate: deposit back to source account
          fromAccount.deposit(this.amount);
        } catch (compensationError) {
          // Compensation failed - this is a critical error requiring manual intervention
          const originalErrorMsg = error instanceof Error ? error.message : 'Unknown error';
          const compensationErrorMsg = compensationError instanceof Error ? compensationError.message : 'Unknown error';
          throw new TransactionExecutionException(
            this.id,
            `Transfer failed after withdrawal: ${originalErrorMsg}. ` +
            `Compensation (rollback) also failed: ${compensationErrorMsg}. ` +
            `Manual intervention required. Source account ${fromAccount.id} may have incorrect balance.`,
          );
        }
        
        // Compensation succeeded, but original operation failed
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        throw new TransactionExecutionException(
          this.id,
          `Deposit to target account ${toAccount.id} failed: ${errorMsg}. ` +
          `Amount has been compensated (rolled back) to source account ${fromAccount.id}.`,
        );
      }
      
      // Withdrawal failed before completion - no compensation needed, just re-throw
      throw error;
    }
  }
}


