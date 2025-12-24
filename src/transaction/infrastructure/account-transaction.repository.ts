import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AccountRepository } from '../../account/application/account.repository';
import { AccountFactory } from '../../account/domain/account.factory';
import { AccountEntity } from '../../account/infrastructure/orm/entities/account.entity';
import { AccountTransactionRepository, TransactionRepository } from '../application/account-transaction.repository';
import { TransactionStatus, TransactionType } from '../domain/transaction.enums';
import { TransactionFactory } from '../domain/transaction.factory';
import { TransactionalContext } from '../domain/transactional-context';
import { LedgerEntryEntity, TransactionEntity } from './orm/entities/transaction.entity';

@Injectable()
export class OrmAccountTransactionRepository implements AccountTransactionRepository {
  constructor(
    private readonly transactionFactory: TransactionFactory,
    private readonly accountFactory: AccountFactory,
    private readonly accountRepository: AccountRepository,
    private readonly transactionRepository: TransactionRepository,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepo: Repository<TransactionEntity>,
    @InjectRepository(LedgerEntryEntity)
    private readonly ledgerRepo: Repository<LedgerEntryEntity>,
    private readonly dataSource: DataSource,
  ) { }

  async loadContext(transactionId: string): Promise<TransactionalContext> {
    const ctx = new TransactionalContext();

    // Load transaction
    const transaction = await this.transactionRepository.getTransaction(transactionId);
    if (!transaction) {
      throw new NotFoundException(`Transaction ${transactionId} not found`);
    }
    ctx.transaction = transaction;

    // Load accounts if they exist
    if (transaction.fromAccountId) {
      const fromAccount = await this.accountRepository.getAccount(
        transaction.fromAccountId,
      );
      if (!fromAccount) {
        throw new NotFoundException(
          `Source account ${transaction.fromAccountId} not found for transaction ${transactionId}`,
        );
      }
      ctx.fromAccount = fromAccount;
    }

    if (transaction.toAccountId) {
      const toAccount = await this.accountRepository.getAccount(
        transaction.toAccountId,
      );
      if (!toAccount) {
        throw new NotFoundException(
          `Target account ${transaction.toAccountId} not found for transaction ${transactionId}`,
        );
      }
      ctx.toAccount = toAccount;
    }

    return ctx;
  }

  async saveContext(ctx: TransactionalContext): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transaction = ctx.getTransaction();

      // Convert domain objects to entities
      const transactionEntity = this.transactionFactory.toEntity(transaction);

      // Save transaction using queryRunner manager to ensure it's in the same transaction

      await queryRunner.manager.save(TransactionEntity, transactionEntity);


      // Save accounts using queryRunner manager to ensure they're in the same transaction
      if (ctx.fromAccount) {
        const fromAccountEntity = this.accountFactory.toEntity(ctx.fromAccount);
        await queryRunner.manager.save(AccountEntity, fromAccountEntity);
      }
      if (ctx.toAccount) {
        const toAccountEntity = this.accountFactory.toEntity(ctx.toAccount);
        await queryRunner.manager.save(AccountEntity, toAccountEntity);
      }

      // Create ledger entries for transaction history
      if (transaction.status === TransactionStatus.COMPLETED && transaction.executedAt) {
        await this.createLedgerEntries(ctx, queryRunner);
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async createLedgerEntries(
    ctx: TransactionalContext,
    queryRunner: any,
  ): Promise<void> {
    const transaction = ctx.getTransaction();
    const fromAccount = ctx.getFromAccount();
    const toAccount = ctx.getToAccount();

    // Create ledger entry for source account (withdraw/transfer)
    if (fromAccount && (transaction.type === TransactionType.WITHDRAW || transaction.type === TransactionType.TRANSFER)) {
      // Use stored balanceBefore if available (set before transaction execution)
      // Otherwise calculate: balanceAfter is current balance, balanceBefore = balanceAfter + amount
      const balanceAfter = fromAccount.getBalance();
      const balanceBefore = ctx.fromAccountBalanceBefore !== undefined
        ? ctx.fromAccountBalanceBefore
        : balanceAfter + transaction.amount; // For withdrawal: balance before = balance after + amount withdrawn

      const fromEntry = new LedgerEntryEntity();
      fromEntry.transactionId = transaction.id;
      fromEntry.accountId = fromAccount.id;
      fromEntry.entryType = 'DEBIT';
      fromEntry.amount = transaction.amount;
      fromEntry.balanceBefore = balanceBefore;
      fromEntry.balanceAfter = balanceAfter;
      fromEntry.createdAt = transaction.executedAt || new Date();

      await queryRunner.manager.save(LedgerEntryEntity, fromEntry);
    }

    // Create ledger entry for target account (deposit/transfer)
    if (toAccount && (transaction.type === TransactionType.DEPOSIT || transaction.type === TransactionType.TRANSFER)) {
      // Use stored balanceBefore if available (set before transaction execution)
      // Otherwise calculate: balanceAfter is current balance, balanceBefore = balanceAfter - amount
      const balanceAfter = toAccount.getBalance();
      const balanceBefore = ctx.toAccountBalanceBefore !== undefined
        ? ctx.toAccountBalanceBefore
        : balanceAfter - transaction.amount; // For deposit: balance before = balance after - amount deposited

      const toEntry = new LedgerEntryEntity();
      toEntry.transactionId = transaction.id;
      toEntry.accountId = toAccount.id;
      toEntry.entryType = 'CREDIT';
      toEntry.amount = transaction.amount;
      toEntry.balanceBefore = balanceBefore;
      toEntry.balanceAfter = balanceAfter;
      toEntry.createdAt = transaction.executedAt || new Date();

      await queryRunner.manager.save(LedgerEntryEntity, toEntry);
    }
  }
}
