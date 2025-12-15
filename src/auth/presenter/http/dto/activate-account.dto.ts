import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ActivateAccountDto {
  @ApiProperty({
    type: 'string',
    description: 'the Activation token sent to the users phone or email',
    required: true,
    example: '531313',
  })
  @IsString()
  @IsNotEmpty()
  activationToken: string;
}
