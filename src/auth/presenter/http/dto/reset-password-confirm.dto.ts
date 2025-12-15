import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class ResetPasswordConfirmDto {
  @ApiProperty({
    example: 'Str0ngP@ssword!',
    maxLength: 255,
    type: 'string',
    minLength: 8,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(255)
  newPassword: string;

  @ApiProperty({
    type: 'string',
    description: 'The user email',
    required: true,
    example: 'karam@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: false,
    type: 'boolean',
  })
  @IsOptional()
  @IsBoolean()
  logoutAllSessions?: boolean;
}
