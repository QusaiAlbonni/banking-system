import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateGroupAccountDto {
  @ApiProperty({
    example: 'Family Savings Group',
    description: 'Name for the group account',
  })
  @IsString()
  @IsNotEmpty()
  groupName: string;

  @ApiProperty({
    example: ['uuid1', 'uuid2', 'uuid3'],
    description: 'Array of member account IDs. All accounts must be of the same type.',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsNotEmpty()
  memberAccountIds: string[];

  @ApiProperty({
    example: 'STANDARD',
    enum: ['STANDARD', 'LOAN', 'FEE_ACCOUNT'],
    description: 'Account type. Must match the type of all member accounts.',
  })
  @IsString()
  @IsNotEmpty()
  accountType: 'STANDARD' | 'LOAN' | 'FEE_ACCOUNT';

  // Standard account fields
  @ApiProperty({
    example: 100000,
    description: 'Maximum withdrawal limit (for STANDARD accounts)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWithdrawal?: number;

  @ApiProperty({
    example: 500000,
    description: 'Maximum deposit limit (for STANDARD/FEE_ACCOUNT accounts)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDeposit?: number;

  // Loan account fields
  @ApiProperty({
    example: 0.05,
    description: 'Annual interest rate (for LOAN accounts)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  loanInterestRate?: number;

  @ApiProperty({
    example: 100,
    description: 'Minimum payment amount (for LOAN accounts)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  loanMinPayment?: number;
}

