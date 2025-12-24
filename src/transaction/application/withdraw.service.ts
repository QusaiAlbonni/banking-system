import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { AccountRepository } from '../../account/application/account.repository';
import { TransactionHandlerChainFactory } from '../domain/transaction-handler-chain.factory';
import { TransactionStatus, TransactionType } from '../domain/transaction.enums';
import { TransactionFactory } from '../domain/transaction.factory';
import { TransactionalContext } from '../domain/transactional-context';
import { AccountOwnershipValidator } from './account-ownership.validator';
import { AccountTransactionRepository } from './account-transaction.repository';
import {
  TransactionDomainException,
  UnauthorizedAccountAccessException,
} from './transaction.exceptions';

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
    private readonly publisher: EventPublisher
  ) {}

  async processWithdraw(
    accountId: string,
    amount: number,
    userId: number,
  ): Promise<TransactionalContext> {
    // Validate amount before proceeding
    if (!amount || amount <= 0 || !Number.isFinite(amount)) {
      throw new BadRequestException(
        'Invalid withdrawal amount. Amount must be greater than 0.',
      );
    }

    // Load account
    const account = await this.accountRepository.getAccount(accountId);
    
    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`);
    }

    // Validate account ownership
    try {
      AccountOwnershipValidator.validateOwnership(account, userId);
    } catch (error) {
      if (error instanceof UnauthorizedAccountAccessException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
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

    // Store balance before transaction execution for ledger entries
    ctx.fromAccountBalanceBefore = account.getBalance();
    
    this.publisher.mergeObjectContext(transaction);
    // Execute transaction
    try {
      const success = transaction.execute(account,undefined);
      if (!success) {
        // Transaction failed
        await this.accountTransactionRepository.saveContext(ctx);
        transaction.commit()
        return ctx;
      }
    } catch (error) {
      // Re-throw domain exceptions as BadRequestException
      if (error instanceof TransactionDomainException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    await this.accountTransactionRepository.saveContext(ctx);
    transaction.commit()

    return ctx;
  }

  async approveWithdraw(
    transactionId: string,
    approvedBy: string,
  ): Promise<TransactionalContext> {
    // Load context
    let ctx: TransactionalContext;
    try {
      ctx = await this.accountTransactionRepository.loadContext(transactionId);
    } catch (error) {
      throw new NotFoundException(
        error instanceof Error
          ? error.message
          : `Transaction ${transactionId} not found`,
      );
    }
  //  temproray solution is to check the status of transaction to be pending 
  // real solution to store the approval value in the domain 
    if (ctx.getTransaction().status!==TransactionStatus.PENDING) {
      throw new BadRequestException(
        'Transaction does not require approval',
      );
    }

    // Validate account ownership before approval
    const account = ctx.getFromAccount();
    if (!account) {
      throw new NotFoundException('Source account not found in transaction context');
    }

    // Approve
    ctx.approve(approvedBy);

    // Execute transaction
    const transaction = ctx.getTransaction();
    this.publisher.mergeObjectContext(transaction);
    try {
      const success = transaction.execute(account,undefined);
      if (!success) {
        ctx.getTransaction().status = TransactionStatus.FAILED;
        await this.accountTransactionRepository.saveContext(ctx);
        transaction.commit();
        return ctx;
      }
    } catch (error) {
      // Re-throw domain exceptions as BadRequestException
      if (error instanceof TransactionDomainException) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }

    // Save account and transaction
    await this.accountTransactionRepository.saveContext(ctx);
    transaction.commit();

    return ctx;
  }
}

