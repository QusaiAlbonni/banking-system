import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountFactory } from './domain/account.factory';
import { OrmAccountRepository } from './infrastructure/account.repository';
import {
  AccountEntity,
  AccountGroupMemberEntity,
} from './infrastructure/orm/entities/account.entity';
import { AccountService } from './application/account.service';
import { AccountController } from './presenter/http/account.controller';
import { AccountRepository } from './application/account.repository';
import { UserModule } from '@/user/user.module';

@Module({
  imports: [
    CqrsModule,
    TypeOrmModule.forFeature([AccountEntity, AccountGroupMemberEntity]),
    UserModule
  ],
  providers: [
    AccountFactory,
    OrmAccountRepository,
    AccountService,
    { provide: AccountRepository, useClass: OrmAccountRepository },
  ],
  controllers: [AccountController],
  exports: [AccountFactory, OrmAccountRepository, AccountService],
})
export class AccountModule {}
