import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    type: 'string',
    description: 'The user email',
    required: true,
    example: 'karam@gmail.com',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}
