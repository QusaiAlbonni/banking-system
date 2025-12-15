/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { i18nValidationMessage } from 'nestjs-i18n';

import { IsNotProfane } from '@/common/decorator';
import { IsPhoneFromCountries } from '@/common/decorator/allowed-countries.decorator';

export class RegisterDto {
  @ApiProperty({
    example: 'John',
    required: true,
    maxLength: 50,
    type: 'string',
    description: 'Customer first name',
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
    description: 'Customer last name',
  })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsNotProfane()
  @MaxLength(50, { message: i18nValidationMessage('validation.maxLength') })
  lastName: string;

  @ApiProperty({ 
    example: 'customer@bank.com', 
    type: 'string',
    description: 'Customer email address (must be unique)',
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @IsEmail({}, { message: i18nValidationMessage('') })
  email: string;

  @ApiProperty({ 
    example: '+963943365119', 
    maxLength: 25, 
    type: 'string',
    description: 'Customer phone number (must be unique, must be from Syria)',
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

  @ApiProperty({ 
    example: 'SecureP@ssw0rd123', 
    maxLength: 255, 
    type: 'string',
    description: 'Customer password (minimum 8 characters, must contain at least one number)',
    format: 'password',
  })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  @MinLength(8, {
    message: i18nValidationMessage('validation.minLength'),
  })
  @MaxLength(255)
  @Matches(/^(?=.*[0-9])/, {
    message: 'Password must contain at least one number',
  })
  password: string;
}

