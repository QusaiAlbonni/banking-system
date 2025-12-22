import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class ApproveTransactionDto {
  @ApiProperty({
    example: '770e8400-e29b-41d4-a716-446655440002',
    description: 'Transaction ID to approve',
  })
  @IsUUID()
  @IsNotEmpty()
  transactionId: string;

  @ApiProperty({
    example: 'manager-123',
    description: 'ID of the manager approving the transaction',
  })
  @IsString()
  @IsNotEmpty()
  approvedBy: string;
}

