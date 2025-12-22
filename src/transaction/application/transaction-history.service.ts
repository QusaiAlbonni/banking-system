import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TransactionStatus, TransactionType } from '../domain/transaction.enums';
import { LedgerEntryEntity, TransactionEntity } from '../infrastructure/orm/entities/transaction.entity';

export interface TransactionHistoryEntry {
  transactionId: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  entryType: 'DEBIT' | 'CREDIT';
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
  executedAt?: Date;
  fromAccountId?: string;
  toAccountId?: string;
  description?: string;
}

export interface AccountTransactionHistory {
  accountId: string;
  transactions: TransactionHistoryEntry[];
  totalDebits: number;
  totalCredits: number;
  currentBalance: number;
}

/**
 * Service for retrieving comprehensive transaction history
 */
@Injectable()
export class TransactionHistoryService {
  constructor(
    @InjectRepository(LedgerEntryEntity)
    private readonly ledgerRepo: Repository<LedgerEntryEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepo: Repository<TransactionEntity>,
  ) {}

  /**
   * Get transaction history for a specific account
   */
  async getAccountHistory(
    accountId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AccountTransactionHistory> {
    const query = this.ledgerRepo
      .createQueryBuilder('ledger')
      .leftJoinAndSelect('ledger.transaction', 'transaction')
      .where('ledger.accountId = :accountId', { accountId })
      .orderBy('ledger.createdAt', 'DESC');

    if (startDate) {
      query.andWhere('ledger.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('ledger.createdAt <= :endDate', { endDate });
    }

    const ledgerEntries = await query.getMany();

    const transactions: TransactionHistoryEntry[] = [];
    let totalDebits = 0;
    let totalCredits = 0;

    for (const entry of ledgerEntries) {
      const transaction = await this.transactionRepo.findOne({
        where: { id: entry.transactionId },
      });

      if (transaction) {
        transactions.push({
          transactionId: transaction.id,
          type: transaction.type as TransactionType,
          amount: entry.amount,
          status: transaction.status as TransactionStatus,
          entryType: entry.entryType as 'DEBIT' | 'CREDIT',
          balanceBefore: entry.balanceBefore,
          balanceAfter: entry.balanceAfter,
          createdAt: transaction.createdAt,
          executedAt: transaction.executedAt,
          fromAccountId: transaction.fromAccountId,
          toAccountId: transaction.toAccountId,
          description: transaction.description,
        });

        if (entry.entryType === 'DEBIT') {
          totalDebits += entry.amount;
        } else {
          totalCredits += entry.amount;
        }
      }
    }

    // Get current balance from the latest entry
    const currentBalance =
      ledgerEntries.length > 0
        ? ledgerEntries[0].balanceAfter
        : 0;

    return {
      accountId,
      transactions,
      totalDebits,
      totalCredits,
      currentBalance,
    };
  }

  /**
   * Get all transactions for an account (including pending)
   */
  async getAllAccountTransactions(
    accountId: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<TransactionHistoryEntry[]> {
    const query = this.transactionRepo
      .createQueryBuilder('transaction')
      .where(
        '(transaction.fromAccountId = :accountId OR transaction.toAccountId = :accountId)',
        { accountId },
      )
      .orderBy('transaction.createdAt', 'DESC');

    if (startDate) {
      query.andWhere('transaction.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      query.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    const transactions = await query.getMany();

    return transactions.map((tx) => ({
      transactionId: tx.id,
      type: tx.type as TransactionType,
      amount: tx.amount,
      status: tx.status as TransactionStatus,
      entryType: tx.fromAccountId === accountId ? 'DEBIT' : 'CREDIT',
      balanceBefore: 0, // Would need to calculate from ledger
      balanceAfter: 0, // Would need to calculate from ledger
      createdAt: tx.createdAt,
      executedAt: tx.executedAt,
      fromAccountId: tx.fromAccountId,
      toAccountId: tx.toAccountId,
      description: tx.description,
    }));
  }

  /**
   * Get transaction history by transaction ID
   */
  async getTransactionHistory(
    transactionId: string,
  ): Promise<TransactionHistoryEntry[]> {
    const transaction = await this.transactionRepo.findOne({
      where: { id: transactionId },
    });

    if (!transaction) {
      return [];
    }

    const ledgerEntries = await this.ledgerRepo.find({
      where: { transactionId },
    });

    return ledgerEntries.map((entry) => ({
      transactionId: transaction.id,
      type: transaction.type as TransactionType,
      amount: entry.amount,
      status: transaction.status as TransactionStatus,
      entryType: entry.entryType as 'DEBIT' | 'CREDIT',
      balanceBefore: entry.balanceBefore,
      balanceAfter: entry.balanceAfter,
      createdAt: transaction.createdAt,
      executedAt: transaction.executedAt,
      fromAccountId: transaction.fromAccountId,
      toAccountId: transaction.toAccountId,
      description: transaction.description,
    }));
  }
}

