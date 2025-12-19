import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateFeeAccountDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Primary owner name for the fee account',
  })
  @IsString()
  @IsNotEmpty()
  primaryOwnerName: string;

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

