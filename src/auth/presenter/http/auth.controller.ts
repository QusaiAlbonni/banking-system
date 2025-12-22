/* eslint-disable prettier/prettier */
import { AuthService } from '@/auth/application/services/auth.service';
import { AuthenticatedUser } from '@/auth/domain/authenticated-user';
import { JwtGuard, RolesGuard } from '@/auth/guard';
import { RefreshTokenGuard } from '@/auth/guard/refresh-token.guard';
import { GetUser } from '@/common/decorator';
import { Role } from '@/user/domain/role';
import { RegisterDto } from '@/user/presenter/http/dto/register.dto';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { NoFilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { Roles } from '../decorator';
import {
  ActivateAccountDto,
  LoginDto,
  ResetPasswordConfirmDto,
  ResetPasswordDto,
  ResetPasswordVerifyDto,
} from './dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @ApiOperation({
    summary: 'Customer Registration',
    description: 'Register a new customer account. Account will be inactive until email verification is completed.',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer registered successfully. Access and refresh tokens are returned. Please verify your email to activate your account.',
    type: RegisterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or user already exists',
  })
  @UseInterceptors(NoFilesInterceptor())
  @ApiBody({ type: RegisterDto })
  @HttpCode(HttpStatus.CREATED)
  @Post('/register')
  async register(@Body() dto: RegisterDto) {
    return await this.authService.register(dto);
  }

  @ApiOperation({
    summary: 'User Login',
    description: 'Login endpoint for all users (customers, staff, and admins). Returns tokens if login is successful and password change is not required.',
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns tokens if mustChangePassword is false, otherwise returns a message indicating password reset is required.',
    type: LoginResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid email or password',
  })
  @UseInterceptors(NoFilesInterceptor())
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() dto: LoginDto) {
    return await this.authService.login(dto);
  }

  @ApiOperation({
    summary: 'Refresh Access Token',
    description: 'Refresh the access token using a valid refresh token.',
  })
  @ApiResponse({
    status: 200,
    description: 'New access and refresh tokens generated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - invalid or expired refresh token',
  })
  @ApiBearerAuth()
  @UseGuards(RefreshTokenGuard)
  @ApiBody({ type: RefreshTokenDto })
  @Post('/refresh')
  async refreshAccessToken(
    @Req() req,
    @Body() dto: RefreshTokenDto,
    @GetUser() userId: AuthenticatedUser,
  ) {
    const rawToken = req.user.rawRefreshToken as string;
    return await this.authService.refreshTokens(userId.id, rawToken);
  }

  @ApiOperation({
    summary: 'Send Account Activation Code',
    description: 'Sends an OTP code to the user\'s email for account activation. Only available for customer accounts (USER role).',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Activation code has been sent to the user\'s email',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - missing or invalid authentication token',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden - only customer accounts can request activation',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'The account is already active or a previous code is still valid',
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard, RolesGuard)
  @Roles(Role.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/send-activation')
  async sendActivation(@GetUser('id') userID: number) {
    console.log(userID);
    return await this.authService.sendActivation(userID);
  }

  @ApiOperation({
    summary: 'Activate Account',
    description: 'Activates the user account using the OTP code sent to their email. Only works for inactive accounts.',
  })
  @ApiBody({ type: ActivateAccountDto })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Account activated successfully',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - missing or invalid authentication token',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'The account is already active',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid or incorrect activation code',
  })
  @ApiBearerAuth()
  @UseGuards(JwtGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/activate-account')
  async activateAccount(
    @GetUser('id') userId: number,
    @Body() dto: ActivateAccountDto,
  ) {
    return this.authService.activateAccount(dto, userId);
  }
  @ApiOperation({ summary: 'Verify token' })
  @ApiBody({ type: ResetPasswordVerifyDto })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'the code has been verified',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'incorrect code or phone number',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/reset-password/verify-token')
  async verifyResetPasswordToken(@Body() dto: ResetPasswordVerifyDto) {
    await this.authService.verifyResetPasswordToken(dto);
  }

  @ApiOperation({ summary: 'Sets a new password' })
  @ApiBody({ type: ResetPasswordConfirmDto })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Something went wrong',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Password successfully reset',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/reset-password/confirm')
  async confirmResetPassword(@Body() dto: ResetPasswordConfirmDto) {
    await this.authService.confirmPasswordReset(dto);
  }

  @ApiOperation({
    summary: 'Request a password reset, sends a code to user phone or email',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The Code have been sent',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Something went wrong',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Past Code is not yet expired',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('/reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

}
