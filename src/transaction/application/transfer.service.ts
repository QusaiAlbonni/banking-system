import { Injectable } from '@nestjs/common';
import { AccountRepository } from '../../account/application/account.repository';
import { TransactionHandlerChainFactory } from '../domain/transaction-handler-chain.factory';
import { TransactionType } from '../domain/transaction.enums';
import { TransactionFactory } from '../domain/transaction.factory';
import { TransactionalContext } from '../domain/transactional-context';
import { AccountTransactionRepository } from './account-transaction.repository';

/**
 * Facade service for transfer operations
 * Hides complex approval workflow and transaction execution
 */
@Injectable()
export class TransferService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionFactory: TransactionFactory,
    private readonly accountTransactionRepository: AccountTransactionRepository,
    private readonly handlerChainFactory: TransactionHandlerChainFactory,
  ) {}

  async requestTransfer(
    fromId: string,
    toId: string,
    amount: number,
  ): Promise<TransactionalContext> {
    // Load accounts
    const fromAccount = await this.accountRepository.getAccount(fromId);
    if (!fromAccount) {
      throw new Error(`Source account ${fromId} not found`);
    }

    const toAccount = await this.accountRepository.getAccount(toId);
    if (!toAccount) {
      throw new Error(`Target account ${toId} not found`);
    }

    if (fromId === toId) {
      throw new Error('Cannot transfer to the same account');
    }

    // Create transaction
    const transaction = this.transactionFactory.newTransaction(
      TransactionType.TRANSFER,
      amount,
      fromId,
      toId,
    );

    // Create context
    const ctx = new TransactionalContext();
    ctx.transaction = transaction;
    ctx.fromAccount = fromAccount;
    ctx.toAccount = toAccount;
    ctx.isNewTransaction = true;

    // Execute approval workflow BEFORE transaction execution
    const handlerChain = this.handlerChainFactory.createDefaultChain();
    handlerChain.handleTransaction(ctx);

    // Check if manager approval is required
    if (ctx.requiresManagerApproval && !ctx.approvedBy) {
      // Save pending transaction for later approval
      await this.accountTransactionRepository.saveContext(ctx);
      return ctx;
    }

    // Execute transaction
    const success = transaction.execute(fromAccount, toAccount);

    if (!success) {
      // Transaction failed
      await this.accountTransactionRepository.saveContext(ctx);
      return ctx;
    }

    // Save accounts and transaction
    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);
    await this.accountTransactionRepository.saveContext(ctx);

    return ctx;
  }

  async approveTransfer(
    transactionId: string,
    approvedBy: string,
  ): Promise<TransactionalContext> {
    // Load context
    const ctx = await this.accountTransactionRepository.loadContext(
      transactionId,
    );

    if (!ctx.requiresManagerApproval) {
      throw new Error('Transaction does not require approval');
    }

    // Approve
    ctx.approve(approvedBy);

    // Execute transaction
    const fromAccount = ctx.getFromAccount();
    const toAccount = ctx.getToAccount();

    if (!fromAccount) {
      throw new Error('Source account not found');
    }
    if (!toAccount) {
      throw new Error('Target account not found');
    }

    const success = ctx.getTransaction().execute(fromAccount, toAccount);

    if (!success) {
      await this.accountTransactionRepository.saveContext(ctx);
      return ctx;
    }

    // Save accounts and transaction
    await this.accountRepository.save(fromAccount);
    await this.accountRepository.save(toAccount);
    await this.accountTransactionRepository.saveContext(ctx);

    return ctx;
  }
}
