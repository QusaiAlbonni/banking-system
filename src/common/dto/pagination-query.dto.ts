import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export abstract class PaginationQueryDto {
  @ApiProperty({ example: '1', type: 'number', default: 1 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    else return parseInt(value);
  })
  page: number = 1;

  @ApiProperty({ example: '10', type: 'number' })
  @IsOptional()
  @IsInt()
  @Max(100)
  @Transform(({ value }) => {
    if (typeof value === 'number') return value;
    else return parseInt(value);
  })
  limit: number = 10;
}
