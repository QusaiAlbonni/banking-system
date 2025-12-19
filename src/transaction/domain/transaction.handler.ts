import { TransactionalContext } from './transactional-context';

export abstract class TransactionHandler {
  protected nextHandler?: TransactionHandler;

  setNextHandler(next: TransactionHandler): void {
    this.nextHandler = next;
  }

  handleTransaction(ctx: TransactionalContext): void {
    this.process(ctx);
    if (this.nextHandler) {
      this.nextHandler.handleTransaction(ctx);
    }
  }

  protected abstract process(ctx: TransactionalContext): void;
}

export class SmallTransactionHandler extends TransactionHandler {
  // Placeholder logic
  protected process(ctx: TransactionalContext): void {
    void ctx;
  }
}

export class ManagerApprovalHandler extends TransactionHandler {
  protected process(ctx: TransactionalContext): void {
    void ctx;
  }
}

export class RiskCheckHandler extends TransactionHandler {
  protected process(ctx: TransactionalContext): void {
    void ctx;
  }
}


