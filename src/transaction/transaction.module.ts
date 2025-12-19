import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionFactory } from './application/transaction.factory';
import { DepositService } from './application/deposit.service';
import { TransferService } from './application/transfer.service';
import { OrmTransactionRepository } from './infrastructure/transaction.repository';
import { OrmAccountTransactionRepository } from './infrastructure/account-transaction.repository';
import { AccountModule } from '../account/account.module';
import { PaymentModule } from '../payment/payment.module';
import {
  LedgerEntryEntity,
  TransactionEntity,
} from './infrastructure/orm/entities/transaction.entity';
import { AccountTransactionRepository } from './application/account-transaction.repository';

@Module({
  imports: [
    CqrsModule,
    AccountModule,
    PaymentModule,
    TypeOrmModule.forFeature([TransactionEntity, LedgerEntryEntity]),
  ],
  providers: [
    TransactionFactory,
    DepositService,
    TransferService,
    OrmTransactionRepository,
    OrmAccountTransactionRepository,
    {
      provide: AccountTransactionRepository,
      useClass: OrmAccountTransactionRepository,
    },
  ],
  exports: [DepositService, TransferService],
})
export class TransactionModule {}
