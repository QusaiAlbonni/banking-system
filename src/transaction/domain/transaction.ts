import { Account } from '@/account/domain/account.interface';
import { AggregateRoot } from '@nestjs/cqrs';
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
   */
  validateState(): boolean {
    if (this.status !== TransactionStatus.PENDING) {
      return false;
    }
    if (this.amount <= 0 || !Number.isFinite(this.amount)) {
      return false;
    }
    return true;
  }

  /**
   * Executes the transaction based on its type
   * Uses Strategy Pattern via Account aggregate for deposit/withdraw operations
   */
  execute(fromAccount?: Account, toAccount?: Account): boolean {
    // Validate transaction state
    if (!this.validateState()) {
      const reason = this.status !== TransactionStatus.PENDING
        ? `Transaction is not in PENDING status. Current status: ${this.status}`
        : 'Invalid transaction amount';
      this.status = TransactionStatus.FAILED;
      this.apply(
        new TransactionFailedEvent(
          this.id,
          this.type,
          this.amount,
          reason,
          this.fromAccountId,
          this.toAccountId,
        ),
      );
      return false;
    }

    try {
      let success = false;

      switch (this.type) {
        case TransactionType.DEPOSIT:
          success = this.executeDeposit(toAccount);
          break;
        case TransactionType.WITHDRAW:
          success = this.executeWithdraw(fromAccount);
          break;
        case TransactionType.TRANSFER:
          success = this.executeTransfer(fromAccount, toAccount);
          break;
        default:
          throw new Error(`Unknown transaction type: ${this.type}`);
      }

      if (success) {
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
      } else {
        this.status = TransactionStatus.FAILED;
        this.apply(
          new TransactionFailedEvent(
            this.id,
            this.type,
            this.amount,
            'Transaction execution failed',
            this.fromAccountId,
            this.toAccountId,
          ),
        );
        return false;
      }
    } catch (error) {
      this.status = TransactionStatus.FAILED;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
      return false;
    }
  }

  private executeDeposit(toAccount?: Account): boolean {
    if (!toAccount) {
      throw new Error('Target account is required for deposit');
    }
    return toAccount.deposit(this.amount);
  }

  private executeWithdraw(fromAccount?: Account): boolean {
    if (!fromAccount) {
      throw new Error('Source account is required for withdrawal');
    }
    return fromAccount.withdraw(this.amount);
  }

  private executeTransfer(fromAccount?: Account, toAccount?: Account): boolean {
    if (!fromAccount) {
      throw new Error('Source account is required for transfer');
    }
    if (!toAccount) {
      throw new Error('Target account is required for transfer');
    }
    // First withdraw from source, then deposit to target
    const withdrawSuccess = fromAccount.withdraw(this.amount);
    if (!withdrawSuccess) {
      return false;
    }
    const depositSuccess = toAccount.deposit(this.amount);
    if (!depositSuccess) {
      // Rollback: deposit back to source account not really acceptable 
      fromAccount.deposit(this.amount);
      return false;
    }
    return true;
  }
}


