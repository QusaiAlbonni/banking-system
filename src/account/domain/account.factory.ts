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
import { AccountStateFactory } from './state/account-state.factory';
import { LoanInterestStrategy } from './strategy/loan-account.strategy';

@Injectable()
export class AccountFactory {
  createFromEntity(
    entity: AccountEntity,
    members?: Account[],
  ): Account {
    const type = entity.accountType;

    if (entity.isGroup) {
      const group = new GroupAccount();
      group.id = entity.id;
      group.ownerId = entity.ownerId;
      group.status = entity.status as AccountStatus;
      group.type = type;
      group.isGroup = true;
      group.groupName = entity.groupName!;
      group.createdAt = entity.createdAt;
      group.updatedAt = entity.updatedAt;
      group.metadata = { accountType: type };
      if (members) {
        group.members = members;
      }
      this.applyStrategies(group, type, entity);
      this.initializeState(group, entity.status as AccountStatus);
      return group;
    }

    const individual = new IndividualAccount();
    individual.id = entity.id;
    individual.ownerId = entity.ownerId;
    individual.status = entity.status as AccountStatus;
    individual.type = entity.accountType;
    individual.primaryOwnerName = entity.primaryOwnerName!;
    individual.createdAt = entity.createdAt;
    individual.updatedAt = entity.updatedAt;
    individual.balance = Number(entity.balance);
    individual.metadata = { accountType: type };
    this.applyStrategies(individual, type, entity);
    this.initializeState(individual, entity.status as AccountStatus);
    return individual;
  }

  toEntity(
    domain: Account,
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
    entity.accountType = domain.type;
    entity.isGroup = domain instanceof GroupAccount;
    entity.groupName = domain instanceof GroupAccount ? domain.groupName : null;
    entity.primaryOwnerName = domain instanceof IndividualAccount ? domain.primaryOwnerName : null;
    entity.balance = domain.getBalance().toString();
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

    return entity;
  }

  newIndividual(
    balance: number,
    ownerId: number,
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
    entity.primaryOwnerName = primaryOwnerName;
    entity.groupName = null;
    entity.balance = balance.toString();
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

    const account = this.createFromEntity(entity);
    return account;
  }

  newGroup(
    ownerId: number,
    groupName: string,
    type: AccountType = AccountType.STANDARD,
    members?: Account[],
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
    entity.groupName = groupName;
    entity.primaryOwnerName = null;
    entity.balance = '0';
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

    const account = this.createFromEntity(entity, members);
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
          entity.loanMinPayment,
        );
        (account as any).InterestStrategy = new LoanInterestStrategy();
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

  /**
   * Initializes the account state based on account status
   */
  private initializeState(account: Account, status: AccountStatus): void {
    (account as any).currentState = AccountStateFactory.createFromStatus(status);
  }
}
