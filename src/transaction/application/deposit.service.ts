import { AccountService } from '@/account/application/account.service';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import { PaymentGateway } from '../../payment/application/payment-gateway.interface';
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
 * Facade service for deposit operations
 * Hides complex approval workflow, payment gateway integration, and transaction execution
 */
@Injectable()
export class DepositService {
  constructor(
    private readonly accountService: AccountService,
    private readonly paymentGateway: PaymentGateway,
    private readonly transactionFactory: TransactionFactory,
    private readonly accountTransactionRepository: AccountTransactionRepository,
    private readonly handlerChainFactory: TransactionHandlerChainFactory,
    private readonly publisher: EventPublisher
  ) {}

  async processDeposit(
    accountId: string,
    amount: number,
    userId: number,
  ): Promise<TransactionalContext> {
    // Validate amount before proceeding
    if (!amount || amount <= 0 || !Number.isFinite(amount)) {
      throw new BadRequestException(
        'Invalid deposit amount. Amount must be greater than 0.',
      );
    }

    // Load account
    const account = await this.accountService.fetchAccount(accountId);
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
      TransactionType.DEPOSIT,
      amount,
      undefined,
      accountId,
    );

    // Create context
    const ctx = new TransactionalContext();
    ctx.transaction = transaction;
    ctx.toAccount = account;
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

    // Charge payment gateway
    const paymentSuccess = this.paymentGateway.charge(amount);
    if (!paymentSuccess) {
      transaction.status = TransactionStatus.FAILED;
      await this.accountTransactionRepository.saveContext(ctx);
      return ctx;
    }

    // Store balance before transaction execution for ledger entries
    ctx.toAccountBalanceBefore = account.getBalance();
    
    // Execute transaction
    this.publisher.mergeObjectContext(transaction);
    try {
      const success = transaction.execute(undefined, account);
      if (!success) {
        // Refund payment gateway on failure
        this.paymentGateway.payout(amount);
        await this.accountTransactionRepository.saveContext(ctx);
        transaction.commit();
        return ctx;
      }
    } catch (error) {
      // Refund payment gateway on domain exception
      this.paymentGateway.payout(amount);
      
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

  async approveDeposit(
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
      throw new BadRequestException(
        'Transaction does not require approval',
      );
    }

    // Validate account ownership before approval
    const account = ctx.getToAccount();
    if (!account) {
      throw new NotFoundException('Target account not found in transaction context');
    }

    // Approve
    ctx.approve(approvedBy);

    // Charge payment gateway
    const amount = ctx.getTransaction().amount;
    const paymentSuccess = this.paymentGateway.charge(amount);
    if (!paymentSuccess) {
      ctx.getTransaction().status = TransactionStatus.FAILED;
      await this.accountTransactionRepository.saveContext(ctx);
      return ctx;
    }

    // Execute transaction
    const transaction = ctx.getTransaction();
  
    if (account) {
      // Store balance before transaction execution for ledger entries
      ctx.toAccountBalanceBefore = account.getBalance();
    }
    
    try {
      const success = transaction.execute(undefined, account);
      if (!success) {
        // Refund payment gateway on failure
        this.paymentGateway.payout(amount);
        ctx.getTransaction().status = TransactionStatus.FAILED;
        await this.accountTransactionRepository.saveContext(ctx);
        transaction.commit();
        return ctx;
      }
    } catch (error) {
      // Refund payment gateway on domain exception
      this.paymentGateway.payout(amount);
      
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
