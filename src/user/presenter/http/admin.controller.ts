/* eslint-disable prettier/prettier */
import { ActiveGuard, JwtGuard, RolesGuard } from '@/auth/guard';
import { Roles } from '@/auth/presenter/decorator';
import { UserService } from '@/user/application/services/user.service';
import { Role } from '@/user/domain/role';
import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateStaffResponseDto } from './dto/create-staff-response.dto';
import { CreateStaffDto } from './dto/create-staff.dto';

@Controller('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ 
    summary: 'Create Staff Member',
    description: 'Create a new staff member (Manager or Teller). Admin only. A temporary password will be generated and should be sent via email. Staff member will be created with isActive=true and mustChangePassword=true.',
  })
  @ApiResponse({
    status: 201,
    description: 'Staff member created successfully. Temporary password should be sent via email.',
    type: CreateStaffResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or email/phone already exists',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - missing or invalid authentication token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - only admins can create staff members',
  })
  @ApiBody({ type: CreateStaffDto })
  @UseGuards(JwtGuard, ActiveGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @Post('create-staff')
  async createStaff(@Body() dto: CreateStaffDto) {
    return this.userService.createStaff(dto);
  }
}

