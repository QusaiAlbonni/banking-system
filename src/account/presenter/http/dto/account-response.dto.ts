import { ApiProperty } from '@nestjs/swagger';
import { AccountType } from '@/account/domain/account-type.enum';
import { AccountStatus } from '@/account/domain/account-status.enum';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class AccountResponseDto {
  @ApiProperty({ example: 'uuid-here' })
  @Expose()
  id: string;

  @Expose()
  @ApiProperty({ example: 'user-uuid' })
  ownerId: string;

  @Expose()
  @ApiProperty({ enum: AccountStatus })
  status: AccountStatus;

  @Expose()
  @ApiProperty({ example: 0 })
  balance: number;

  @Expose()
  @ApiProperty({ enum: AccountType })
  accountType: AccountType;

  @Expose()
  @ApiProperty({ example: false })
  isGroup: boolean;

  @Expose()
  @ApiProperty({ example: 'John Doe', required: false })
  primaryOwnerName?: string;

  @Expose()
  @ApiProperty({ example: 'Family Group', required: false })
  groupName?: string;

  @Expose()
  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  createdAt: Date;

  @Expose()
  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  updatedAt: Date;
}

