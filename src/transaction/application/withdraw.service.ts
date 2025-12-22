import { Injectable } from '@nestjs/common';
import { AccountRepository } from '../../account/application/account.repository';
import { TransactionHandlerChainFactory } from '../domain/transaction-handler-chain.factory';
import { TransactionType } from '../domain/transaction.enums';
import { TransactionFactory } from '../domain/transaction.factory';
import { TransactionalContext } from '../domain/transactional-context';
import { AccountTransactionRepository } from './account-transaction.repository';

/**
 * Facade service for withdrawal operations
 * Hides complex approval workflow and transaction execution
 */
@Injectable()
export class WithdrawService {
  constructor(
    private readonly accountRepository: AccountRepository,
    private readonly transactionFactory: TransactionFactory,
    private readonly accountTransactionRepository: AccountTransactionRepository,
    private readonly handlerChainFactory: TransactionHandlerChainFactory,
  ) {}

  async processWithdraw(
    accountId: string,
    amount: number,
  ): Promise<TransactionalContext> {
    // Load account
    const account = await this.accountRepository.getAccount(accountId);
    if (!account) {
      throw new Error(`Account ${accountId} not found`);
    }

    // Create transaction
    const transaction = this.transactionFactory.newTransaction(
      TransactionType.WITHDRAW,
      amount,
      accountId,
    );

    // Create context
    const ctx = new TransactionalContext();
    ctx.transaction = transaction;
    ctx.fromAccount = account;
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
    const success = transaction.execute(account);

    if (!success) {
      // Transaction failed
      await this.accountTransactionRepository.saveContext(ctx);
      return ctx;
    }

    // Save account and transaction
    await this.accountRepository.save(account);
    await this.accountTransactionRepository.saveContext(ctx);

    return ctx;
  }

  async approveWithdraw(
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
    const account = ctx.getFromAccount();
    if (!account) {
      throw new Error('Source account not found');
    }

    const success = ctx.getTransaction().execute(account);

    if (!success) {
      await this.accountTransactionRepository.saveContext(ctx);
      return ctx;
    }

    // Save account and transaction
    await this.accountRepository.save(account);
    await this.accountTransactionRepository.saveContext(ctx);

    return ctx;
  }
}

