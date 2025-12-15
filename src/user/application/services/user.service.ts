/* eslint-disable prettier/prettier */
import { AuthService } from '@/auth/application/services/auth.service';
import { TokenService } from '@/auth/application/services/token.service';
import { AuthJwtPayload } from '@/common/types/auth-jwtPayload';
import { mergeDefinedV2 } from '@/common/utils';
import { i18nErrorMessage } from '@/translations/error-message';
import { Role } from '@/user/domain/role';
import { User } from '@/user/domain/user';
import { QueryUserDto } from '@/user/presenter/http/dto/query-user.dto';
import { RegisterDto } from '@/user/presenter/http/dto/register.dto';
import { UpdateUserDto } from '@/user/presenter/http/dto/update-user.dto';
import { UserResponseDto } from '@/user/presenter/http/dto/user-response.dto';
import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';
import { UserRepository } from '../ports/user.repository';
import { EmailService } from '@/email/email.service';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepo: UserRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly tokenService: TokenService,
    private readonly emailService: EmailService,
    private readonly dataSource: DataSource,
  ) { }


  async updateProfile(
    userId: number,
    dto: UpdateUserDto,
  ) {
    const user = await this.userRepo.findOne(userId, false);
    if (!user) {
      throw new NotFoundException(i18nErrorMessage('common.USER_NOT_FOUND'));
    }
    if (dto.phone && dto.phone !== user.phone) {
      await this.checkPhoneNumberIsUnique(dto.phone);
    }
    mergeDefinedV2(user, dto);

    try {
      const saved = await this.userRepo.save(user);
      return plainToInstance(UserResponseDto, saved);
    } catch (err: any) {
      if (err?.code === '23505') {
        throw new BadRequestException(
          i18nErrorMessage('common.DUPLICATE_VALUE'),
        );
      }
      throw err;
    }
  }

  async findByEmail(email: string) {
    return this.userRepo.findByEmail(email);
  }

  async findAll(query: QueryUserDto, url: string) {
    const paginatedResult = await this.userRepo.findAllWithPagination(
      query,
      url,
    );
    paginatedResult.items = plainToInstance(
      UserResponseDto,
      paginatedResult.items,
      {
        groups: [query.role!],
      },
    );
    return paginatedResult;
  }

  async findByIds(ids: number[]) {
    return await this.userRepo.findByIds(ids);
  }

  async findOne(id: number, fetchUserInfo?: boolean) {
    return await this.userRepo.findOne(id, fetchUserInfo);
  }

  // async findDriverWithProfile(id: number) {
  //   return await this.driverRepo.findByDriverId(id, true);
  // }




  async register(registerDto: RegisterDto) {
    const { firstName, lastName, email, phone, password } = registerDto;
    const hashPassword = this.authService.hashPassword(password);
    const emailInUse = this.userRepo.checkEmailIfExist(email);
    const phoneCheckPromise = this.checkPhoneNumberIsUnique(phone);
    await Promise.all([emailInUse, phoneCheckPromise]);

    const hash = await hashPassword;
    // Registration is only for customers
    const userEntity = await this.userRepo.create(
      firstName,
      lastName,
      email,
      phone,
      hash,
      Role.USER,
      false, // mustChangePassword
    );
    // Customer registration: isActive = false, mustChangePassword = false
    userEntity.isActive = false;
    userEntity.mustChangePassword = false;
    const saved = await this.userRepo.save(userEntity);
    const payload: AuthJwtPayload = {
      sub: userEntity.id,
      email: userEntity.email,
      role: userEntity.role,
    };

    const accesToken = await this.tokenService.generateUserToken(payload);
    const refreshToken = await this.authService.storeToken(
      payload,
      payload.sub,
    );

    return {
      message: 'Registration successful. Please verify your email to activate your account.',
      accesToken,
      refresh: refreshToken.token,
      user: plainToInstance(UserResponseDto, saved),
    };
  }

  async activateUser(user: User) {
    user.isActive = true;
    const result = await this.userRepo.save(user);

    return result;
  }




  async deactivateUser(user: User) {
    user.isActive = false;
    const result = await this.userRepo.save(user);

    return result;
  }

  async changePassword(hash: string, user: User) {
    user.password = hash;
    user.mustChangePassword = false;
    return await this.userRepo.save(user);
  }

  async createStaff(
    createStaffDto: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      role: Role.MANAGER | Role.TELLER;
    },
  ) {
    const { firstName, lastName, email, phone, role } = createStaffDto;

    // Check if email/phone already exists
    const emailInUse = this.userRepo.checkEmailIfExist(email);
    const phoneCheckPromise = this.checkPhoneNumberIsUnique(phone);
    await Promise.all([emailInUse, phoneCheckPromise]);

    // Generate temporary password
    const tempPassword = this.generateTemporaryPassword();
    const hash = await this.authService.hashPassword(tempPassword);

    const userEntity = await this.userRepo.create(
      firstName,
      lastName,
      email,
      phone,
      hash,
      role,
      true, // mustChangePassword
    );
    // Staff: isActive = true, mustChangePassword = true
    userEntity.isActive = true;
    userEntity.mustChangePassword = true;
    const saved = await this.userRepo.save(userEntity);

    await this.emailService.sendTemporaryPasswordEmail(
      email,
      tempPassword,
    );

    return {
      message: `Staff member created successfully. Temporary password sent to ${email}.`,
      user: plainToInstance(UserResponseDto, saved),
    };
  }

  private generateTemporaryPassword(): string {
    // Generate a random 12-character password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async changeUserPassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.findOne(userId);
    if (!user) {
      throw new NotFoundException(i18nErrorMessage('common.USER_NOT_FOUND'));
    }

    // Verify old password
    const passwordMatches = await this.authService.verifyPassword(
      oldPassword,
      user.password,
    );
    if (!passwordMatches) {
      throw new BadRequestException('Invalid current password');
    }

    // Hash new password
    const hash = await this.authService.hashPassword(newPassword);

    // Update password and set mustChangePassword to false
    user.password = hash;
    user.mustChangePassword = false;
    const saved = await this.userRepo.save(user);

    return {
      message: 'Password changed successfully',
      user: plainToInstance(UserResponseDto, saved),
    };
  }

  private async checkPhoneNumberIsUnique(phone: string) {
    const existingUser = await this.userRepo.findByPhone(phone);
    if (existingUser) {
      throw new BadRequestException([i18nErrorMessage('common.EXISTING_USER')]);
    }
  }
  async createAdmin(adminDto: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: Role;
  }) {
    const { firstName, lastName, email, phone, password } = adminDto;
    const hashPassword = this.authService.hashPassword(password);
    const emailInUse = this.userRepo.checkEmailIfExist(email);
    const phoneCheckPromise = this.checkPhoneNumberIsUnique(phone);
    await Promise.all([emailInUse, phoneCheckPromise]);

    const hash = await hashPassword;
    const userEntity = await this.userRepo.create(
      firstName,
      lastName,
      email,
      phone,
      hash,
      Role.ADMIN,
      false, // mustChangePassword
    );
    // Admin is automatically activated by BeforeInsert hook
    userEntity.isActive = true;
    userEntity.mustChangePassword = false;
    const saved = await this.userRepo.save(userEntity);
    const payload: AuthJwtPayload = {
      sub: userEntity.id,
      email: userEntity.email,
      role: userEntity.role,
    };

    const accesToken = await this.tokenService.generateUserToken(payload);
    const refreshToken = await this.authService.storeToken(
      payload,
      payload.sub,
    );
    return {
      accesToken,
      refreshToken:refreshToken.token,
      user:plainToInstance(UserResponseDto, saved),
    }
  }


}
