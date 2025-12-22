import { UserModule } from '@/user/user.module';
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountRepository } from './application/account.repository';
import { AccountService } from './application/account.service';
import { AccountFactory } from './domain/account.factory';
import { OrmAccountRepository } from './infrastructure/account.repository';
import {
  AccountEntity,
  AccountGroupMemberEntity,
} from './infrastructure/orm/entities/account.entity';
import { AccountController } from './presenter/http/account.controller';

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
  exports: [
    AccountFactory,
    OrmAccountRepository,
    AccountService,
    AccountRepository,
  ],
})
export class AccountModule {}
