import { IsNotProfane } from '@/common/decorator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateDriverProfileDto {
  @ApiPropertyOptional({
    example: 'Toyota Corolla',
    description: 'Vehicle display name',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      vehicleName: i18nValidationMessage('validation.vehicleName'),
    }),
  })
  @MaxLength(50, { message: i18nValidationMessage('validation.maxLength') })
  vehicleName?: string;

  @ApiPropertyOptional({
    example: 'white',
    description: 'Vehicle color',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      color: i18nValidationMessage('validation.color'),
    }),
  })
  @MaxLength(50, { message: i18nValidationMessage('validation.maxLength') })
  color?: string;

  @ApiPropertyOptional({
    example: 'ABC-1234',
    description: 'License plate number',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      licensePlate: i18nValidationMessage('validation.licensePlate'),
    }),
  })
  @MaxLength(50, { message: i18nValidationMessage('validation.maxLength') })
  licensePlate?: string;

  @ApiPropertyOptional({
    example: 'Good condition, no accidents',
    description: 'Optional description',
  })
  @IsNotProfane({ message: i18nValidationMessage('validation.isNotProfane') })
  @IsOptional()
  @Transform(({ value }) => {
    // normalize common stringy null/undefined and convert non-strings to string
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    if (value == null) return value;
    if (typeof value !== 'string') return String(value);
    return value;
  })
  @MaxLength(500, { message: i18nValidationMessage('validation.maxLength') })
  description?: string;

  @ApiPropertyOptional({
    example: 4,
    description: 'Number of seats (positive integer)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    if (value == null) return value;
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  })
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  seatsNumber?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Maximum package weight in kilograms (>= 0)',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'null') return null;
    if (value === 'undefined') return undefined;
    if (value == null) return value;
    const num = Number(value);
    return Number.isNaN(num) ? value : num;
  })
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @Min(0, { message: i18nValidationMessage('validation.min') })
  maxPackageWeightKg?: number;
}
