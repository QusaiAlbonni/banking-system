import { UserResponseDto } from '@/user/presenter/http/dto/user-response.dto';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    type: 'string',
    description: 'Success message',
    example: 'Registration successful. Please verify your email to activate your account.',
  })
  message: string;

  @ApiProperty({
    type: 'string',
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accesToken: string;

  @ApiProperty({
    type: 'string',
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Registered user information',
  })
  user: UserResponseDto;
}

