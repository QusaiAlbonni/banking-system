import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

import { IsNotProfane } from '@/common/decorator';
import { IsPhoneFromCountries } from '@/common/decorator/allowed-countries.decorator';
import { Transform } from 'class-transformer';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateUserDto {
  @ApiProperty({
    example: 'John',
    required: false,
    maxLength: 50,
    type: 'string',
  })
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      firstName: i18nValidationMessage('validation.firstName'),
    }),
  })
  @IsNotProfane()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @MaxLength(50, {
    message: i18nValidationMessage('validation.maxLength'),
  })
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    required: false,
    maxLength: 50,
    type: 'string',
  })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsNotProfane()
  @MaxLength(50, { message: i18nValidationMessage('validation.maxLength') })
  lastName?: string;

  @ApiProperty({ example: '+963943365119', maxLength: 25, type: 'string' })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsPhoneNumber(undefined, {
    message: i18nValidationMessage('validation.isPhoneNumber'),
  })
  @IsPhoneFromCountries(['SY'], {
    message: i18nValidationMessage('validation.isPhoneFromCountries'),
  })
  @MaxLength(25)
  phone?: string;
}
