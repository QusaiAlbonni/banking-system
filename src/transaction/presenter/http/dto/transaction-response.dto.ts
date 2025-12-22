import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { TransactionStatus, TransactionType } from '@/transaction/domain/transaction.enums';

@Exclude()
export class TransactionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @Expose()
  id: string;

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

  @ApiProperty({ enum: TransactionType })
  @Expose()
  type: TransactionType;

  @ApiProperty({ example: 1000.0 })
  @Expose()
  amount: number;

  @ApiProperty({ enum: TransactionStatus })
  @Expose()
  status: TransactionStatus;

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

  @ApiProperty({ example: false })
  @Expose()
  requiresManagerApproval: boolean;

  @ApiProperty({
    example: 45,
    required: false,
    nullable: true,
    description: 'Risk score calculated during approval workflow',
  })
  @Expose()
  riskScore?: number;

  @ApiProperty({
    example: 'High risk score detected: 75. Transaction requires manager approval.',
    required: false,
    nullable: true,
  })
  @Expose()
  approvalNotes?: string;

  @ApiProperty({
    example: 'manager-123',
    required: false,
    nullable: true,
  })
  @Expose()
  approvedBy?: string;

  @ApiProperty({
    example: '2024-01-01T00:00:00Z',
    required: false,
    nullable: true,
  })
  @Expose()
  approvedAt?: Date;
}

