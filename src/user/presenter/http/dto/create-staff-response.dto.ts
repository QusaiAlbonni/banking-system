import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from './user-response.dto';

export class CreateStaffResponseDto {
  @ApiProperty({
    type: 'string',
    description: 'Success message indicating staff member was created',
    example: 'Staff member created successfully. Temporary password sent to staff@gmail.com.',
  })
  message: string;

  @ApiProperty({
    type: UserResponseDto,
    description: 'Created staff member information',
  })
  user: UserResponseDto;
}

