import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class TransactionHistoryQueryDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Account ID to get history for',
  })
  @IsUUID()
  accountId: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    description: 'Start date for filtering transactions',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    example: '2024-12-31T23:59:59Z',
    description: 'End date for filtering transactions',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

