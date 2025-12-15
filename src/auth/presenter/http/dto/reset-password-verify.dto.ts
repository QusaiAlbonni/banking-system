import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ResetPasswordVerifyDto {
  @ApiProperty({
    example: '531321',
    type: 'string',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

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
