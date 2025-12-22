import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { TransactionStatus, TransactionType } from '@/transaction/domain/transaction.enums';

@Exclude()
export class TransactionHistoryEntryDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  transactionId: string;

  @ApiProperty({ enum: TransactionType })
  @Expose()
  type: TransactionType;

  @ApiProperty({ example: 1000.0 })
  @Expose()
  amount: number;

  @ApiProperty({ enum: TransactionStatus })
  @Expose()
  status: TransactionStatus;

  @ApiProperty({ enum: ['DEBIT', 'CREDIT'] })
  @Expose()
  entryType: 'DEBIT' | 'CREDIT';

  @ApiProperty({ example: 5000.0 })
  @Expose()
  balanceBefore: number;

  @ApiProperty({ example: 6000.0 })
  @Expose()
  balanceAfter: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    required: false,
    nullable: true,
  })
  @Expose()
  executedAt?: Date;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    required: false,
    nullable: true,
  })
  @Expose()
  fromAccountId?: string;

  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440001',
    required: false,
    nullable: true,
  })
  @Expose()
  toAccountId?: string;

  @ApiProperty({
    example: 'Payment for services',
    required: false,
    nullable: true,
  })
  @Expose()
  description?: string;
}

@Exclude()
export class AccountTransactionHistoryDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  accountId: string;

  @ApiProperty({ type: [TransactionHistoryEntryDto] })
  @Expose()
  transactions: TransactionHistoryEntryDto[];

  @ApiProperty({ example: 5000.0 })
  @Expose()
  totalDebits: number;

  @ApiProperty({ example: 10000.0 })
  @Expose()
  totalCredits: number;

  @ApiProperty({ example: 15000.0 })
  @Expose()
  currentBalance: number;
}

