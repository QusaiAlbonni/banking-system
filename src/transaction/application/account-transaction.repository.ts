import { Transaction } from "../domain/transaction";
import { TransactionalContext } from "../domain/transactional-context";

export abstract class AccountTransactionRepository {
  abstract loadContext(transactionId: string): Promise<TransactionalContext>;
  abstract saveContext(ctx: TransactionalContext): Promise<void>;
}

export abstract class TransactionRepository {
  abstract getTransaction(id: string): Promise<Transaction | null>;
  abstract save(transaction: Transaction): Promise<void>;
}