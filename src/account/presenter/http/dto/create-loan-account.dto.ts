import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateLoanAccountDto {
  @ApiProperty({
    example: 'John Doe',
    description: 'Primary owner name for the loan account',
  })
  @IsString()
  @IsNotEmpty()
  primaryOwnerName: string;

  @ApiProperty({
    example: 0.05,
    description: 'Annual interest rate (e.g., 0.05 for 5%)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  loanInterestRate?: number;

  @ApiProperty({
    example: 100,
    description: 'Minimum payment amount',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  loanMinPayment?: number;
}

