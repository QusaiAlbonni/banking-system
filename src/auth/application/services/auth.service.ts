/* eslint-disable prettier/prettier */
import {
  ActivateAccountDto,
  LoginDto,
  ResetPasswordConfirmDto,
  ResetPasswordDto,
  ResetPasswordVerifyDto,
} from '@/auth/presenter/http/dto';
import { i18nErrorMessage } from '@/translations/error-message';
import { UserService } from '@/user/application/services/user.service';
import { RegisterDto } from '@/user/presenter/http/dto/register.dto';

import { AuthenticatedUser } from '@/auth/domain/authenticated-user';
import { AuthJwtPayload } from '@/common/types/auth-jwtPayload';
import { Role } from '@/user/domain/role';
import { UserResponseDto } from '@/user/presenter/http/dto/user-response.dto';
import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { plainToInstance } from 'class-transformer';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  private readonly otpTtl: number;
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly otpService: OtpService,
  ) {
    this.otpTtl = parseInt(configService.get<string>('OTP_TTL') || '500000');
  }

  async register(dto: RegisterDto): Promise<{
    message: string;
    user: UserResponseDto;
  }> {
    return await this.userService.register(dto);
  }

  async login(dto: LoginDto) {
    const user = await this.userService.findByEmail(dto.email);
    const e = new BadRequestException(
      i18nErrorMessage('common.INVALID_CREDENTIALS'),
    );

    if (!user || !user.password) {
      throw e;
    }
    const passowrdMatches = await this.verifyPassword(
      dto.password,
      user.password,
    );
    if (!passowrdMatches) {
      throw e;
    }

    const payload: AuthJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accesToken = await this.tokenService.generateUserToken(payload);
    const refreshToken = await this.storeToken(payload, user.id);
    return {
      accesToken,
      refreshToken: refreshToken.token,
      user: plainToInstance(UserResponseDto, user, {
        excludeExtraneousValues: true,
        groups: [user.role],
      }),
    };
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const isValid = await this.tokenService.validateRefreshToken(
      userId,
      refreshToken,
    );
    if (!isValid) throw new UnauthorizedException('Invalid refresh token');

    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const payload: AuthJwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const newAccessToken = await this.tokenService.generateUserToken(payload);
    const newRefreshToken = await this.rotateRefreshToken(
      payload,
      refreshToken,
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
  async storeToken(payload: any, userId: number) {
    const refreshToken = this.tokenService.generateRefreshToken(payload);
    const token = await this.tokenService.createRefreshToken(
      userId,
      await refreshToken,
      'refresh',
    );
    return token;
  }
  async rotateRefreshToken(payload: AuthJwtPayload, oldToken: string) {
    await this.tokenService.revokeRefreshToken(payload.sub, oldToken);

    const rawToken = this.tokenService.generateRefreshToken(payload);

    const record = this.tokenService.createRefreshToken(
      payload.sub,
      await rawToken,
      'refresh',
    );
    return (await record).token;
  }
  async hashPassword(password: string): Promise<string> {
    return argon.hash(password);
  }
  async verifyPassword(candidate: string, hash: string): Promise<boolean> {
    return argon.verify(hash, candidate);
  }

  async sendActivation(userId: number): Promise<void> {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    if (user.isActive) {
      throw new ConflictException('Account is already active');
    }

    const key = `otp:activation:${userId}`;
    const existingOtp = await this.otpService.getOtp(key);
    
    // Only prevent sending if there's an existing unverified OTP
    // If OTP is verified or expired, allow sending a new one
    if (existingOtp && !existingOtp.verified) {
      throw new ConflictException(
        i18nErrorMessage('common.OTP_ALREADY_SENT') || 
        'An activation code has already been sent. Please check your email or wait for it to expire.'
      );
    }

    const otp = await this.otpService.generateOtp(this.otpTtl, 6, key);
    if (!otp) {
      throw new InternalServerErrorException('Failed to generate activation code');
    }
    
    await this.otpService.sendOtp(otp, user.email);
  }
  async authenticate(token: string) {
    if (!token) {
      return null;
    }
    try {
      const payload = await this.tokenService.verify(token) as AuthJwtPayload;
      const user = new AuthenticatedUser();
      user.id = payload.sub;
      user.email = payload.email;
      user.role = payload.role as Role;
      return user;
    } catch {
      return null;
    }
  }
  async activateAccount(dto: ActivateAccountDto, userId: number) {
    const user = await this.userService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (user.isActive) {
      throw new ConflictException(
        i18nErrorMessage('common.ACCOUNT_ALREADY_ACTIVE') || 
        'Account is already active'
      );
    }

    const key = `otp:activation:${user.id}`;

    // Verify the OTP code
    const isValid = await this.otpService.verifyOtp(dto.activationToken, key);
    if (!isValid) {
      throw new BadRequestException(
        i18nErrorMessage('common.INVALID_ACTIVATION_TOKEN') || 
        'Invalid activation code. Please check and try again.'
      );
    }
    await this.otpService.markAsVerified(key, this.otpTtl);

    await this.userService.activateUser(user);
    await this.postResetCleanup(key);
  }
  async postResetCleanup(key: string) {
    await this.otpService.deleteOtp(key);
    return;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw new BadRequestException([
        'لا يوجد لهذا المستخدم حساب يرجى انشاء حساب اولاً',
      ]);
    }
    const key = `otp:reset_password:${user.id}`;
    const existingOtp = await this.otpService.getOtp(key);
    if (existingOtp) {
      throw new ConflictException(i18nErrorMessage('common.OTP_ALREADY_SENT'));
    }
    const otp = await this.otpService.generateOtp(this.otpTtl, 6, key);
    if (!otp) {
      throw new InternalServerErrorException();
    }
    await this.otpService.sendOtp(otp, user.email);
  }

  async confirmPasswordReset(dto: ResetPasswordConfirmDto) {
    const e = new BadRequestException(['حصل خطأ']);

    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw e;
    }

    const key = `otp:reset_password:${user.id}`;

    const otp = await this.otpService.getOtp(key);

    if (!otp || !otp.verified) throw e;

    const hash = await this.hashPassword(dto.newPassword);

    await this.userService.changePassword(hash, user);

    // if (dto.logoutAllSessions) {
    //   await this.tokenService.deleteAllTokens(user);
    // }

    await this.postResetCleanup(key);
  }

  async verifyResetPasswordToken(dto: ResetPasswordVerifyDto) {
    const e = new BadRequestException(['حصل خطأ']);

    const user = await this.userService.findByEmail(dto.email);
    if (!user) {
      throw e;
    }

    const key = `otp:reset_password:${user.id}`;
    const result = await this.otpService.verifyOtp(dto.token, key);

    if (!result) {
      throw e;
    }

    try {
      await this.otpService.markAsVerified(key, this.otpTtl);
    } catch {
      throw e;
    }
  }
}
