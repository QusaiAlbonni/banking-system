import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

import { i18nValidationMessage } from 'nestjs-i18n';

export class ChangePasswordDto {
  @ApiProperty({
    type: 'string',
    description: 'Current password',
    example: 'OldP@ssw0rd!',
  })
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @IsNotEmpty({ message: i18nValidationMessage('validation.isNotEmpty') })
  currentPassword: string;

  @ApiProperty({
    example: 'NewStr0ngP@ssword!',
    maxLength: 255,
    type: 'string',
    description: 'New password',
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
  newPassword: string;
}

