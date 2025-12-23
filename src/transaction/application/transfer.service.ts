import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AccountRepository } from '../../account/application/account.repository';
import { TransactionHandlerChainFactory } from '../domain/transaction-handler-chain.factory';
import {
  TransactionStatus,
  TransactionType,
} from '../domain/transaction.enums';
import { TransactionFactory } from '../domain/transaction.factory';
import { TransactionalContext } from '../domain/transactional-context';
import { AccountOwnershipValidator } from './account-ownership.validator';
import { AccountTransactionRepository } from './account-transaction.repository';
import {
  TransactionDomainException,
  UnauthorizedAccountAccessException,
} from './transaction.exceptions';
import { EventPublisher } from '@nestjs/cqrs';

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
    private readonly eventPublisher: EventPublisher,
  ) {}

  async requestTransfer(
    fromId: string,
    toId: string,
    amount: number,
    userId: number,
  ): Promise<TransactionalContext> {
    // Validate amount before proceeding
    if (!amount || amount <= 0 || !Number.isFinite(amount)) {
      throw new BadRequestException(
        'Invalid transfer amount. Amount must be greater than 0.',
      );
    }

    // Validate accounts are different
    if (fromId === toId) {
      throw new BadRequestException('Cannot transfer to the same account');
    }

    // Load accounts
    const fromAccount = await this.accountRepository.getAccount(fromId);
    if (!fromAccount) {
      throw new NotFoundException(`Source account ${fromId} not found`);
    }

    const toAccount = await this.accountRepository.getAccount(toId);
    if (!toAccount) {
      throw new NotFoundException(`Target account ${toId} not found`);
    }

    // Validate both accounts belong to the user
    try {
      AccountOwnershipValidator.validateOwnershipForTransfer(
        fromAccount,
        toAccount,
        userId,
      );
    } catch (error) {
      if (error instanceof UnauthorizedAccountAccessException) {
        throw new ForbiddenException(error.message);
      }
      throw error;
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
    try {
      this.eventPublisher.mergeObjectContext(transaction);
      const success = transaction.execute(fromAccount, toAccount);
      if (!success) {
        // Transaction failed
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

    // Save accounts and transaction
    await this.accountTransactionRepository.saveContext(ctx);
    transaction.commit();

    return ctx;
  }

  async approveTransfer(
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

    if (!ctx.requiresManagerApproval) {
      throw new BadRequestException('Transaction does not require approval');
    }

    const fromAccount = ctx.getFromAccount();
    const toAccount = ctx.getToAccount();

    if (!fromAccount) {
      throw new NotFoundException(
        'Source account not found in transaction context',
      );
    }
    if (!toAccount) {
      throw new NotFoundException(
        'Target account not found in transaction context',
      );
    }

    // Approve
    ctx.approve(approvedBy);

    // Execute transaction
    const transaction = ctx.getTransaction();
    try {
      this.eventPublisher.mergeObjectContext(transaction);
      const success = transaction.execute(fromAccount, toAccount);
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

    // Save accounts and transaction
    await this.accountTransactionRepository.saveContext(ctx);
    transaction.commit();

    return ctx;
  }
}
