import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateStandardAccountDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Primary owner name for the account',
  })
  @IsString()
  @IsNotEmpty()
  primaryOwnerName: string;

  @ApiProperty({
    example: 100000,
    description: 'Maximum withdrawal limit (optional)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxWithdrawal?: number;

  @ApiProperty({
    example: 500000,
    description: 'Maximum deposit limit (optional)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDeposit?: number;
}

