import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class ChangePasswordResponseDto {
  @ApiProperty({
    type: 'string',
    description: 'Success message',
    example: 'Password changed successfully',
  })
  message: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Updated user information',
  })
  user: UserResponseDto;
}

