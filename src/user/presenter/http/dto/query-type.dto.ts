// import { Ordering } from '@/database/types';
// import { ApiProperty } from '@nestjs/swagger';
// import { Transform } from 'class-transformer';
// import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
// export enum VehicleTypeOrderBy {
//   id = 'id',
//   name = 'name',
//   createdAt = 'created_at',
//   updatedAt = 'updated_at',
// }
// export class QueryTypeDto {
//   @ApiProperty({ example: 'driver', enum: AllowedRoles })
//   @IsOptional()
//   @IsEnum(AllowedRoles)
//   role?: string;
//   @ApiProperty({ example: 'classic', required: false })
//   @IsOptional()
//   @IsString()
//   name?: string;

//   @ApiProperty({
//     example: VehicleTypeOrderBy.id,
//     enum: VehicleTypeOrderBy,
//     default: VehicleTypeOrderBy.id,
//   })
//   @IsOptional()
//   @IsEnum(VehicleTypeOrderBy)
//   orderBy?: VehicleTypeOrderBy = VehicleTypeOrderBy.id;

//   @ApiProperty({ example: Ordering.ASC, enum: Ordering, default: Ordering.ASC })
//   @IsOptional()
//   @IsEnum(Ordering)
//   ordering?: Ordering = Ordering.ASC;

//   @ApiProperty({ example: 1, required: false })
//   @IsOptional()
//   @IsInt()
//   @Transform(({ value }) =>
//     typeof value === 'number' ? value : parseInt(value),
//   )
//   page?: number = 1;

//   @ApiProperty({ example: 10, required: false })
//   @IsOptional()
//   @IsInt()
//   @Transform(({ value }) =>
//     typeof value === 'number' ? value : parseInt(value),
//   )
//   limit?: number = 10;
// }
