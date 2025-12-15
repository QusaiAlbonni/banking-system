/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
} from 'class-validator';

import { i18nValidationMessage } from 'nestjs-i18n';

import { IsNotProfane } from '@/common/decorator';
import { IsPhoneFromCountries } from '@/common/decorator/allowed-countries.decorator';
import { Role } from '@/user/domain/role';

export class CreateStaffDto {
  @ApiProperty({
    example: 'John',
    required: true,
    maxLength: 50,
    type: 'string',
    description: 'Staff member first name',
  })
  @IsString({
    message: i18nValidationMessage('validation.isString', {
      firstName: i18nValidationMessage('validation.firstName'),
    }),
  })
  @IsNotProfane()
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @MaxLength(50, {
    message: i18nValidationMessage('validation.maxLength'),
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    required: true,
    maxLength: 50,
    type: 'string',
    description: 'Staff member last name',
  })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsNotProfane()
  @MaxLength(50, { message: i18nValidationMessage('validation.maxLength') })
  lastName: string;

  @ApiProperty({
    example: 'manager',
    enum: [Role.MANAGER, Role.TELLER],
    description: 'Staff role - must be either manager or teller',
    enumName: 'StaffRole',
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsEnum([Role.MANAGER, Role.TELLER], {
    message: 'Role must be either manager or teller',
  })
  role: Role.MANAGER | Role.TELLER;

  @ApiProperty({
    example: 'manager@bank.com',
    type: 'string',
    description: 'Staff member email address (must be unique)',
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsEmail({}, { message: i18nValidationMessage('') })
  email: string;

  @ApiProperty({
    example: '+963943365119',
    maxLength: 25,
    type: 'string',
    description: 'Staff member phone number (must be unique, must be from Syria)',
  })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsPhoneNumber(undefined, {
    message: i18nValidationMessage('validation.isPhoneNumber'),
  })
  @IsPhoneFromCountries(['SY'], {
    message: i18nValidationMessage('validation.isPhoneFromCountries'),
  })
  @MaxLength(25)
  phone: string;
}

