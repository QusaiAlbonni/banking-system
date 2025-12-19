import { Injectable } from '@nestjs/common';
import { OrmAccountTransactionRepository } from '../infrastructure/account-transaction.repository';
import { TransactionFactory } from './transaction.factory';
import { AccountFactory } from '../../account/domain/account.factory';
import { TransactionType } from '../domain/transaction.enums';
import { TransactionalContext } from '../domain/transactional-context';

@Injectable()
export class TransferService {
  constructor(
    private readonly accountTransactionRepository: OrmAccountTransactionRepository,
    private readonly transactionFactory: TransactionFactory,
    private readonly accountFactory: AccountFactory,
  ) {}

  async requestTransfer(
    fromId: string,
    toId: string,
    amount: number,
  ): Promise<TransactionalContext> {
    //same steps as deposit service 
    // withdraw service should be the same roughly too
    return {} as any;
  }
}
