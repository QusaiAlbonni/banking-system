import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '../account/account.module';
import { PaymentModule } from '../payment/payment.module';
import { UserModule } from '../user/user.module';
import { AccountTransactionRepository, TransactionRepository } from './application/account-transaction.repository';
import { DepositService } from './application/deposit.service';
import { TransactionHistoryService } from './application/transaction-history.service';
import { TransferService } from './application/transfer.service';
import { WithdrawService } from './application/withdraw.service';
import { TransactionHandlerChainFactory } from './domain/transaction-handler-chain.factory';
import { TransactionFactory } from './domain/transaction.factory';
import { OrmAccountTransactionRepository } from './infrastructure/account-transaction.repository';
import {
  LedgerEntryEntity,
  TransactionEntity,
} from './infrastructure/orm/entities/transaction.entity';
import {
  OrmTransactionRepository,
} from './infrastructure/transaction.repository';
import { TransactionController } from './presenter/http/transaction.controller';
import { TransactionHistoryController } from './presenter/http/transaction-history.controller';
import { NotificationsModule } from '@/notifications/notifications.module';

@Module({
  imports: [
    CqrsModule,
    AccountModule,
    PaymentModule,
    UserModule,
    TypeOrmModule.forFeature([TransactionEntity, LedgerEntryEntity]),
    NotificationsModule
  ],
  controllers: [
    TransactionController,
    TransactionHistoryController,
  ],
  providers: [
    TransactionFactory,
    TransactionHandlerChainFactory,
    DepositService,
    WithdrawService,
    TransferService,
    TransactionHistoryService,
    OrmTransactionRepository,
    OrmAccountTransactionRepository,
    {
      provide: AccountTransactionRepository,
      useClass: OrmAccountTransactionRepository,
    },
    {
      provide: TransactionRepository,
      useClass: OrmTransactionRepository,
    },
  ],
  exports: [
    DepositService,
    WithdrawService,
    TransferService,
    TransactionHistoryService,
  ],
})
export class TransactionModule {}
