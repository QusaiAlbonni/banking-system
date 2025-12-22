import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class TransferRequestDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Source account ID for the transfer',
  })
  @IsUUID()
  @IsNotEmpty()
  fromAccountId: string;

  @ApiProperty({
    example: '660e8400-e29b-41d4-a716-446655440001',
    description: 'Target account ID for the transfer',
  })
  @IsUUID()
  @IsNotEmpty()
  toAccountId: string;

  @ApiProperty({
    example: 250.0,
    description: 'Amount to transfer',
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;
}

