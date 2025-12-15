import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    type: 'string',
    description: 'User email address',
    required: true,
    example: 'customer@bank.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    type: 'string',
    description: 'User password',
    required: true,
    example: 'SecureP@ssw0rd123',
    format: 'password',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class LogoutDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}
