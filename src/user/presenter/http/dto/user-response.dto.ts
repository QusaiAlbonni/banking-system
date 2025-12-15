import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponseDto {
  @ApiProperty({
    type: 'number',
    description: 'the unque identifier of the user',
    example: 1,
  })
  @Expose()
  id: number;

  @ApiProperty({
    type: 'string',
    description: 'the first name of the user',
    example: 'John',
  })
  @Expose()
  firstName?: string;

  @ApiProperty({
    type: 'string',
    description: 'the last name of the user',
    example: 'Doe',
  })
  @Expose()
  lastName?: string;

  @ApiProperty({ example: 'karam@gmail.com', maxLength: 50, type: 'string' })
  @Expose()
  email: string;

  @ApiProperty({ example: '+963943365119', maxLength: 25, type: 'string' })
  @Expose()
  phone: string;

  @ApiHideProperty()
  @Exclude()
  password?: string;

  @ApiProperty({
    type: 'boolean',
    description: 'if the user account is activated',
    example: false,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    type: 'boolean',
    description: 'if the user must change password',
    example: false,
  })
  @Expose()
  mustChangePassword: boolean;

  @ApiProperty({
    type: 'string',
    description: 'The role of the user in the banking system',
    enum: ['user', 'admin', 'manager', 'teller'],
    example: 'user',
  })
  @Expose()
  role: string;
  @ApiProperty({
    type: 'string',
    description: 'the date in which the user was created',
    example: '2025-02-14T07:12:36.176Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    type: 'string',
    description: 'the date in which the user was updated',
    example: '2025-02-14T07:12:36.176Z',
  })
  @Expose()
  updatedAt: Date;
}
