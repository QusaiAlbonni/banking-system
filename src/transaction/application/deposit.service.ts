import { Injectable } from '@nestjs/common';
import { Transaction } from '../domain/transaction';
import { PaymentGateway } from '../../payment/application/payment-gateway.interface';
import { TransactionalContext } from '../domain/transactional-context';
import { AccountTransactionRepository } from './account-transaction.repository';

@Injectable()
export class DepositService {
  constructor(
    private readonly paymentGateway: PaymentGateway,
    private readonly accountTransactionRepository: AccountTransactionRepository,
  ) {}

  async processDeposit(ctx: TransactionalContext): Promise<boolean> {
    //use the handlers here to verify transaction validity
    //a handler down the chain needs to call .execute() and commit()
    //or one of the handlers mark it as manager approval needed
    const transaction: Transaction = ctx.getTransaction();
    const success = this.paymentGateway.charge(transaction.amount);
    if (!success) {
      return false;
    }
    transaction.execute();
    await this.accountTransactionRepository.saveContext(ctx);
    transaction.commit();
    return true;
  }
}
