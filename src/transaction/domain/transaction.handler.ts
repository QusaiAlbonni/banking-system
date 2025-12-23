import { TransactionType } from './transaction.enums';
import { TransactionalContext } from './transactional-context';

export abstract class TransactionHandler {
  protected nextHandler?: TransactionHandler;

  setNextHandler(next: TransactionHandler): void {
    this.nextHandler = next;
  }

  handleTransaction(ctx: TransactionalContext): void {

    this.process(ctx);
    if (!ctx.requiresManagerApproval && this.nextHandler) {
      this.nextHandler.handleTransaction(ctx);
    }
  }

  protected abstract process(ctx: TransactionalContext): void;
}

/**
 * Handles small transactions that don't require approval
 * Transactions below threshold are auto-approved
 */
export class SmallTransactionHandler extends TransactionHandler {
  private readonly smallTransactionThreshold: number;

  constructor(smallTransactionThreshold: number = 1000) {
    super();
    this.smallTransactionThreshold = smallTransactionThreshold;
  }

  protected process(ctx: TransactionalContext): void {
    const transaction = ctx.getTransaction();
    const amount = transaction.amount;
    // Small transactions are auto-approved, no further processing needed
    if (amount <= this.smallTransactionThreshold) {
      ctx.clearManagerApprovalRequirement();
      return;
    }
    // For larger transactions, pass to next handler
  }
}

/**
 * Performs risk assessment on transactions
 * Calculates risk score and may require manager approval for high-risk transactions
 */
export class RiskCheckHandler extends TransactionHandler {
  private readonly highRiskThreshold: number;
  private readonly riskScoreThreshold: number;

  constructor(
    highRiskThreshold: number = 10000,
    riskScoreThreshold: number = 70,
  ) {
    super();
    this.highRiskThreshold = highRiskThreshold;
    this.riskScoreThreshold = riskScoreThreshold;
  }

  protected process(ctx: TransactionalContext): void {
    const transaction = ctx.getTransaction();
    const amount = transaction.amount;
    const fromAccount = ctx.getFromAccount();
    const toAccount = ctx.getToAccount();

    // Calculate risk score
    let riskScore = 0;

    // Amount-based risk
    if (amount > this.highRiskThreshold) {
      riskScore += 40;
    } else if (amount > this.highRiskThreshold * 0.5) {
      riskScore += 20;
    }

    // Account-based risk checks
    if (fromAccount) {
      const balance = fromAccount.getBalance();
      // High withdrawal percentage
      if (transaction.type === TransactionType.WITHDRAW || transaction.type === TransactionType.TRANSFER) {
        if (balance > 0 && amount / balance > 0.8) {
          riskScore += 30;
        }
        // Low balance after transaction
        if (balance - amount < 100) {
          riskScore += 20;
        }
      }
    }

    // Transfer to unknown account (could be enhanced with account history)
    if (transaction.type === TransactionType.TRANSFER && toAccount) {
      // Check if account is new or has suspicious activity
      // For now, we'll add risk for transfers to accounts with low balance
      const toBalance = toAccount.getBalance();
      if (toBalance < 100 && amount > 5000) {
        riskScore += 15;
      }
    }

    ctx.riskScore = riskScore;

    // Require manager approval for high-risk transactions
    if (riskScore >= this.riskScoreThreshold) {
      ctx.markForManagerApproval(
        `High risk score detected: ${riskScore}. Transaction requires manager approval.`,
      );
    }
  }
}

/**
 * Handles manager approval requirement
 * This handler should be placed at the end of the chain
 * It checks if approval is required and blocks execution if not approved
 */
export class ManagerApprovalHandler extends TransactionHandler {
  protected process(ctx: TransactionalContext): void {
    // If manager approval is required but not yet approved, block the transaction
    if (ctx.requiresManagerApproval && !ctx.approvedBy) {
      // Transaction is blocked - this should be checked before execution
      // The application service should handle this case
      return;
    }

  }
}


