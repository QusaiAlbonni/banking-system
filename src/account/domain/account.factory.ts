import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  AccountEntity,
  AccountGroupMemberEntity,
} from '../infrastructure/orm/entities/account.entity';
import { Account } from './account.interface';
import { GroupAccount, IndividualAccount } from './account';
import {
  LoanAccountStrategy,
  NoDepositStrategy,
  NoWithdrawStrategy,
  StandardAccountStrategy,
} from './strategy';
import { AccountStatus } from './account-status.enum';
import { AccountType } from './account-type.enum';

@Injectable()
export class AccountFactory {
  createFromEntity(
    entity: AccountEntity,
    members?: IndividualAccount[],
  ): Account {
    const type = (entity.accountType as AccountType) ?? AccountType.STANDARD;

    if (entity.isGroup) {
      const group = new GroupAccount();
      group.id = entity.id;
      group.ownerId = entity.ownerId;
      group.status = entity.status as AccountStatus;
      group['isGroup'] = true;
      group['groupName'];
      group.createdAt = entity.createdAt;
      group.updatedAt = entity.updatedAt;
      group.metadata = { accountType: type };
      if (members) {
        group.members = members;
      }
      this.applyStrategies(group, type, entity);
      return group;
    }

    const individual = new IndividualAccount();
    individual.id = entity.id;
    individual.ownerId = entity.ownerId;
    individual.status = entity.status as AccountStatus;
    individual.createdAt = entity.createdAt;
    individual.updatedAt = entity.updatedAt;
    individual.balance = entity.balance;
    individual.metadata = { accountType: type };
    this.applyStrategies(individual, type, entity);
    return individual;
  }

  toEntity(
    domain: Account,
    type: AccountType = AccountType.STANDARD,
    members?: Account[],
    strategyConfig?: {
      loanInterestRate?: number;
      loanMinPayment?: number;
      maxDeposit?: number;
      maxWithdrawal?: number;
    },
  ): AccountEntity {
    const entity = new AccountEntity();
    entity.id = domain.id;
    entity.ownerId = domain.ownerId;
    entity.accountType = type;
    entity.isGroup = domain instanceof GroupAccount;
    entity.balance = domain.getBalance();
    entity.status = domain.status;

    // Set strategy configuration fields if provided
    if (strategyConfig) {
      if (strategyConfig.loanInterestRate !== undefined) {
        entity.loanInterestRate = strategyConfig.loanInterestRate;
      }
      if (strategyConfig.loanMinPayment !== undefined) {
        entity.loanMinPayment = strategyConfig.loanMinPayment;
      }
      if (strategyConfig.maxDeposit !== undefined) {
        entity.maxDeposit = strategyConfig.maxDeposit;
      }
      if (strategyConfig.maxWithdrawal !== undefined) {
        entity.maxWithdrawal = strategyConfig.maxWithdrawal;
      }
    }

    if (domain instanceof GroupAccount && members && members.length > 0) {
      entity.groupMembers = members.map((member) => {
        const gm = new AccountGroupMemberEntity();
        gm.groupAccountId = domain.id;
        gm.memberAccountId = member.id;
        return gm;
      });
    }

    // createdAt/updatedAt/version/joinedAt are handled by TypeORM columns.
    return entity;
  }

  newIndividual(
    ownerId: string,
    primaryOwnerName: string,
    type: AccountType = AccountType.STANDARD,
    strategyConfig?: {
      loanInterestRate?: number;
      loanMinPayment?: number;
      maxDeposit?: number;
      maxWithdrawal?: number;
    },
  ): Account {
    const entity = new AccountEntity();
    entity.id = randomUUID();
    entity.ownerId = ownerId;
    entity.accountType = type;
    entity.isGroup = false;
    entity.balance = 0;
    entity.status = AccountStatus.ACTIVE;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    entity.groupMembers = [];
    if (strategyConfig) {
      if (strategyConfig.loanInterestRate !== undefined) {
        entity.loanInterestRate = strategyConfig.loanInterestRate;
      }
      if (strategyConfig.loanMinPayment !== undefined) {
        entity.loanMinPayment = strategyConfig.loanMinPayment;
      }
      if (strategyConfig.maxDeposit !== undefined) {
        entity.maxDeposit = strategyConfig.maxDeposit;
      }
      if (strategyConfig.maxWithdrawal !== undefined) {
        entity.maxWithdrawal = strategyConfig.maxWithdrawal;
      }
    }

    const account = this.createFromEntity(entity) as IndividualAccount;
    account.primaryOwnerName = primaryOwnerName;
    account.metadata.primaryOwnerName = primaryOwnerName;
    return account;
  }

  newGroup(
    ownerId: string,
    groupName: string,
    type: AccountType = AccountType.STANDARD,
    members?: IndividualAccount[],
    strategyConfig?: {
      loanInterestRate?: number;
      loanMinPayment?: number;
      maxDeposit?: number;
      maxWithdrawal?: number;
    },
  ): Account {
    const entity = new AccountEntity();
    entity.id = randomUUID();
    entity.ownerId = ownerId;
    entity.accountType = type;
    entity.isGroup = true;
    entity.balance = 0;
    entity.status = AccountStatus.ACTIVE;
    entity.createdAt = new Date();
    entity.updatedAt = new Date();
    entity.groupMembers = [];
    if (strategyConfig) {
      if (strategyConfig.loanInterestRate !== undefined) {
        entity.loanInterestRate = strategyConfig.loanInterestRate;
      }
      if (strategyConfig.loanMinPayment !== undefined) {
        entity.loanMinPayment = strategyConfig.loanMinPayment;
      }
      if (strategyConfig.maxDeposit !== undefined) {
        entity.maxDeposit = strategyConfig.maxDeposit;
      }
      if (strategyConfig.maxWithdrawal !== undefined) {
        entity.maxWithdrawal = strategyConfig.maxWithdrawal;
      }
    }

    const account = this.createFromEntity(entity, members) as GroupAccount;
    account.groupName = groupName;
    account.metadata.groupName = groupName;
    return account;
  }

  /**
   * Internal helper: select appropriate strategies per account type.
   * Uses optional fields from entity to configure strategies.
   */
  private applyStrategies(
    account: Account,
    type: AccountType,
    entity: AccountEntity,
  ): void {
    switch (type) {
      case AccountType.LOAN:
        // Loans only allow deposits (repayments), no withdrawals.
        // Use loan-specific fields from entity if available
        (account as any).withdrawStrategy = new NoWithdrawStrategy();
        (account as any).depositStrategy = new LoanAccountStrategy(
          entity.loanInterestRate,
          entity.loanMinPayment,
        );
        break;
      case AccountType.FEE_ACCOUNT:
        // Example: fee account only receives deposits, never withdraws directly.
        // Use standard limits if configured
        (account as any).withdrawStrategy = new NoWithdrawStrategy();
        (account as any).depositStrategy = new StandardAccountStrategy(
          entity.maxWithdrawal,
          entity.maxDeposit,
        );
        break;
      case AccountType.STANDARD:
      default:
        // Use standard limits if configured in entity
        (account as any).withdrawStrategy = new StandardAccountStrategy(
          entity.maxWithdrawal,
          entity.maxDeposit,
        );
        (account as any).depositStrategy = new StandardAccountStrategy(
          entity.maxWithdrawal,
          entity.maxDeposit,
        );
        break;
    }
  }
}
