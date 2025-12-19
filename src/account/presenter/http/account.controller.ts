/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveGuard, JwtGuard } from '@/auth/guard';
import { GetUser } from '@/common/decorator';
import { AuthenticatedUser } from '@/auth/domain/authenticated-user';
import { AccountService } from '@/account/application/account.service';
import { AccountType } from '@/account/domain/account-type.enum';
import { CreateStandardAccountDto } from './dto/create-standard-account.dto';
import { CreateLoanAccountDto } from './dto/create-loan-account.dto';
import { CreateFeeAccountDto } from './dto/create-fee-account.dto';
import { CreateGroupAccountDto } from './dto/create-group-account.dto';
import { AccountResponseDto } from './dto/account-response.dto';
import { Account } from '@/account/domain/account.interface';
import { IndividualAccount, GroupAccount } from '@/account/domain/account';
import { plainToInstance } from 'class-transformer';

@ApiTags('Accounts')
@Controller('accounts')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @ApiOperation({
    summary: 'Open Standard Account',
    description: 'Create a new standard individual account for the authenticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Standard account created successfully',
    type: AccountResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBody({ type: CreateStandardAccountDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('standard')
  async createStandardAccount(
    @Body() dto: CreateStandardAccountDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<AccountResponseDto> {
    const account = await this.accountService.createIndividualAccount({
      ownerId: user.id.toString(),
      primaryOwnerName: dto.primaryOwnerName,
      accountType: AccountType.STANDARD,
      maxDeposit: dto.maxDeposit,
      maxWithdrawal: dto.maxWithdrawal,
    });

    return this.mapToResponse(account);
  }

  @ApiOperation({
    summary: 'Open Loan Account',
    description: 'Create a new loan individual account for the authenticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Loan account created successfully',
    type: AccountResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBody({ type: CreateLoanAccountDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('loan')
  async createLoanAccount(
    @Body() dto: CreateLoanAccountDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<AccountResponseDto> {
    const account = await this.accountService.createIndividualAccount({
      ownerId: user.id.toString(),
      primaryOwnerName: dto.primaryOwnerName,
      accountType: AccountType.LOAN,
      loanInterestRate: dto.loanInterestRate,
      loanMinPayment: dto.loanMinPayment,
    });

    return this.mapToResponse(account);
  }

  @ApiOperation({
    summary: 'Open Fee Account',
    description: 'Create a new fee individual account for the authenticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Fee account created successfully',
    type: AccountResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBody({ type: CreateFeeAccountDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('fee')
  async createFeeAccount(
    @Body() dto: CreateFeeAccountDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<AccountResponseDto> {
    const account = await this.accountService.createIndividualAccount({
      ownerId: user.id.toString(),
      primaryOwnerName: dto.primaryOwnerName,
      accountType: AccountType.FEE_ACCOUNT,
      maxDeposit: dto.maxDeposit,
    });

    return this.mapToResponse(account);
  }

  @ApiOperation({
    summary: 'Open Group Account',
    description:
      'Create a new group account. All member accounts must be of the same type as the group account type.',
  })
  @ApiResponse({
    status: 201,
    description: 'Group account created successfully',
    type: AccountResponseDto,
  })
  @ApiResponse({
    status: 400,
    description:
      'Invalid input data, member accounts not found, or member accounts have different types',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiBody({ type: CreateGroupAccountDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('group')
  async createGroupAccount(
    @Body() dto: CreateGroupAccountDto,
    @GetUser() user: AuthenticatedUser,
  ): Promise<AccountResponseDto> {
    const accountType = dto.accountType as AccountType;
    const account = await this.accountService.createGroupAccount({
      ownerId: user.id.toString(),
      groupName: dto.groupName,
      accountType,
      memberAccountIds: dto.memberAccountIds,
      loanInterestRate: dto.loanInterestRate,
      loanMinPayment: dto.loanMinPayment,
      maxDeposit: dto.maxDeposit,
      maxWithdrawal: dto.maxWithdrawal,
    });

    return this.mapToResponse(account);
  }

  private mapToResponse(account: Account): AccountResponseDto {
    return plainToInstance(AccountResponseDto, account);
  }
}

