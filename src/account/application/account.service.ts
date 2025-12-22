import { Injectable, BadRequestException } from '@nestjs/common';
import { AccountFactory } from '../domain/account.factory';
import { OrmAccountRepository } from '../infrastructure/account.repository';
import { AccountType } from '../domain/account-type.enum';
import { Account } from '../domain/account.interface';
import { IndividualAccount } from '../domain/account';
import { AccountEntity } from '../infrastructure/orm/entities/account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountRepository } from './account.repository';

export interface CreateIndividualAccountDto {
  ownerId: number;
  primaryOwnerName: string;
  accountType: AccountType;
  loanInterestRate?: number;
  loanMinPayment?: number;
  maxDeposit?: number;
  maxWithdrawal?: number;
  balance?: number;
}

export interface CreateGroupAccountDto {
  ownerId: number;
  groupName: string;
  accountType: AccountType;
  memberAccountIds: string[];
  loanInterestRate?: number;
  loanMinPayment?: number;
  maxDeposit?: number;
  maxWithdrawal?: number;
}

@Injectable()
export class AccountService {
  constructor(
    private readonly accountFactory: AccountFactory,
    private readonly accountRepository: AccountRepository,
    @InjectRepository(AccountEntity)
    private readonly accountEntityRepo: Repository<AccountEntity>,
  ) {}

  async fetchAccount(id: string){
    return await this.accountRepository.getAccount(id);
  }

  async closeAccount(id) {
    
  }

  async createIndividualAccount(
    dto: CreateIndividualAccountDto,
  ): Promise<Account> {
    const account = this.accountFactory.newIndividual(
      dto.balance ?? 0,
      dto.ownerId,
      dto.primaryOwnerName,
      dto.accountType,
    );

    await this.accountRepository.save(account);

    // Reload to get the persisted entity with all fields
    const savedAccount = await this.accountRepository.getAccount(account.id);
    return savedAccount || account;
  }

  async createGroupAccount(dto: CreateGroupAccountDto): Promise<Account> {
    if (!dto.memberAccountIds || dto.memberAccountIds.length === 0) {
      throw new BadRequestException(
        'Group account must have at least one member account',
      );
    }

    // Load all member accounts and verify they exist and are of the same type
    const memberAccounts: IndividualAccount[] = [];
    for (const memberId of dto.memberAccountIds) {
      const member = await this.accountRepository.getAccount(memberId);
      if (!member) {
        throw new BadRequestException(
          `Member account with ID ${memberId} not found`,
        );
      }
      if (!(member instanceof IndividualAccount)) {
        throw new BadRequestException(
          `Account ${memberId} is not an individual account`,
        );
      }
      memberAccounts.push(member);
    }

    // Verify all members are of the same type
    const memberEntities = await Promise.all(
      memberAccounts.map((acc) =>
        this.accountEntityRepo.findOne({ where: { id: acc.id } }),
      ),
    );

    const memberTypes = memberEntities
      .filter((e) => e !== null)
      .map((e) => e!.accountType);

    if (memberTypes.length === 0) {
      throw new BadRequestException('Could not load member account types');
    }

    const uniqueTypes = new Set(memberTypes);
    if (uniqueTypes.size > 1) {
      throw new BadRequestException(
        'All member accounts must be of the same type',
      );
    }

    // Verify the group type matches member type
    const memberType = memberTypes[0] as AccountType;
    if (memberType !== dto.accountType) {
      throw new BadRequestException(
        `Group account type ${dto.accountType} must match member account type ${memberType}`,
      );
    }

    // Create group account
    const groupAccount = this.accountFactory.newGroup(
      dto.ownerId,
      dto.groupName,
      dto.accountType,
      memberAccounts,
      dto
    );

    await this.accountRepository.save(groupAccount);

    // Reload to get the persisted entity with all fields
    const savedAccount = await this.accountRepository.getAccount(
      groupAccount.id,
    );
    return savedAccount!;
  }
}
