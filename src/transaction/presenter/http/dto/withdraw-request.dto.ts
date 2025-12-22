import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';

export class WithdrawRequestDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'Source account ID for the withdrawal',
  })
  @IsUUID()
  @IsNotEmpty()
  accountId: string;

  @ApiProperty({
    example: 500.0,
    description: 'Amount to withdraw',
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @IsNotEmpty()
  amount: number;
}

