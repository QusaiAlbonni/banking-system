import { Ordering } from '@/database/types';
import { Role } from '@/user/domain/role';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

enum OrderByEnum {
  averageRating = 'average_rating',
  createdAt = 'created_at',
  updatedAt = 'updated_at',
  firstName = 'first_name',
  lastName = 'last_name',
  id = 'id',
}

export class QueryUserDto {
  @ApiProperty({ example: 'admin', enum: Role, enumName: 'UserRole' })
  @IsOptional()
  @IsEnum(Role)
  role?: string;



  @ApiProperty({ example: 'true', type: 'boolean' })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    else return value === 'true';
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ example: '1', type: 'number', default: 1 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    else return parseInt(value);
  })
  page?: number = 1;

  @ApiProperty({ example: '10', type: 'number' })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    else return parseInt(value);
  })
  limit?: number;

  @ApiProperty({ example: 'Joe', type: 'string' })
  @IsOptional()
  @IsString()
  @MaxLength(4096)
  search?: string;

  @ApiProperty({
    example: OrderByEnum.id,
    enum: OrderByEnum,
    enumName: 'OrderByEnum',
    default: OrderByEnum.id,
  })
  @IsOptional()
  @IsEnum(OrderByEnum)
  orderBy?: OrderByEnum = OrderByEnum.id;

  @ApiProperty({
    example: Ordering.ASC,
    enum: Ordering,
    enumName: 'Ordering',
    default: Ordering.ASC,
  })
  @IsOptional()
  @IsEnum(Ordering)
  ordering?: Ordering = Ordering.ASC;
}
