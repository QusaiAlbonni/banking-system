/* eslint-disable prettier/prettier */
import { UserResponseDto } from '@/user/presenter/http/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class LoginResponseDto {
  @ApiProperty({
    type: 'boolean',
    description: 'Indicates if the user must change their password',
    example: false,
  })
  mustChangePassword: boolean;

  @ApiProperty({
    type: 'string',
    description: 'JWT access token (only returned if mustChangePassword is false)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  accesToken?: string;

  @ApiProperty({
    type: 'string',
    description: 'JWT refresh token (only returned if mustChangePassword is false)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    required: false,
  })
  refreshToken?: string;

  @ApiProperty({
    type: 'string',
    description: 'Message indicating password reset is required (only returned if mustChangePassword is true)',
    example: 'Password reset is required. Please change your password.',
    required: false,
  })
  message?: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'User information',
  })
  user: UserResponseDto;
}

