/* eslint-disable prettier/prettier */
import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards
} from '@nestjs/common';
import { ChangePasswordResponseDto } from './dto/change-password-response.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';

import { AuthenticatedUser } from '@/auth/domain/authenticated-user';
import { ActiveGuard, JwtGuard } from '@/auth/guard';
import { FullUrl, GetUser } from '@/common/decorator';
import { PaginatedDto } from '@/common/dto';
import { ApiMultipart } from '@/swagger';
import { UserService } from '@/user/application/services/user.service';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { plainToInstance } from 'class-transformer';
import { QueryUserDto } from './dto/query-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Controller('user')
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({
    summary: 'List Users',
    description: 'Get a paginated list of users. Can be filtered by role, active status, and search query.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users retrieved successfully',
    type: PaginatedDto<UserResponseDto>(UserResponseDto),
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid authentication token',
  })
  @ApiBearerAuth()
  @Throttle({ default: { ttl: 500, limit: 5 } })
  @Get()
  async listAll(@Query() query: QueryUserDto, @FullUrl() url: string) {
    return this.userService.findAll(query, url);
  }

  @ApiOperation({ 
    summary: 'Get Authenticated User',
    description: 'Get the currently authenticated user\'s profile information.',
  })
  @ApiResponse({
    status: 200,
    description: 'Authenticated user data retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid authentication token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Get('me')
  async findMe(@GetUser() user: AuthenticatedUser) {
    const result = await this.userService.findOne(user.id, true);
    return plainToInstance(UserResponseDto, result, {
      groups: [user.role],
    });
  }

  @ApiOperation({ 
    summary: 'Change Password',
    description: 'Change the authenticated user\'s password. After successful change, mustChangePassword flag is set to false.',
  })
  @ApiResponse({
    status: 200,
    description: 'Password changed successfully',
    type: ChangePasswordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid current password or new password does not meet requirements',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid authentication token',
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @Patch('change-password')
  async changePassword(
    @GetUser('id') userId: AuthenticatedUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.userService.changeUserPassword(
      userId.id,
      dto.currentPassword,
      dto.newPassword,
    );
  }



  @ApiOperation({ 
    summary: 'Get User by ID',
    description: 'Get user information by user ID.',
  })
  @ApiResponse({
    status: 200,
    description: 'User information retrieved successfully',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiBearerAuth()
  @Get('/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    const user = this.userService.findOne(id);
    return plainToInstance(UserResponseDto, user);
  }

 

  
}
