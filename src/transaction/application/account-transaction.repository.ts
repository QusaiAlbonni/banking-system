import { TransactionalContext } from "../domain/transactional-context";

export abstract class AccountTransactionRepository {
  abstract loadContext(transactionId: string): Promise<TransactionalContext>;
  abstract saveContext(ctx: TransactionalContext): Promise<void>;
}