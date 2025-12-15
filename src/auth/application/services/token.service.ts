import { Token } from '@/auth/domain/token';
import { UserService } from '@/user/application/services/user.service';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Cache } from 'cache-manager';
import type { StringValue } from 'ms';
import { TokenRepository } from '../ports/token.repository';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private tokenRepository: TokenRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async generateUserToken(payload: any): Promise<string> {
    const expiresIn = (this.configService.get<string>('JWT_EXPIRES_IN') ||
      '1h') as StringValue;
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET') || '',
      expiresIn,
    });
    return accessToken;
  }

  async verify(token: string) {
    return await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET') || '',
    });
  }

  generateRefreshToken(payload: any) {
    const expiresIn = (this.configService.get<string>(
      'REFRESH_JWT_EXPIRES_IN',
    ) || '7d') as StringValue;
    const refreshToken = this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('REFRESH_JWT_SECRET') || '',
      expiresIn,
    });
    return refreshToken;
  }

  async createRefreshToken(
    userId: number,
    token: string,
    type: string,
  ): Promise<Token> {
    const user = await this.userService.findOne(userId);
    if (!user) throw new NotFoundException('User not found');

    await this.tokenRepository.revokeTokensForUser(userId, 'refresh');
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '1h';
    const expiresAt = this.calculateExpiry(expiresIn);
    const newToken = this.tokenRepository.create(
      user.id,
      token,
      type,
      expiresAt,
    );
    return newToken;
  }
  async validateRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<boolean> {
    const tokens = await this.tokenRepository.findByUserId(userId);
    console.log('tokenId', tokens.at(0)?.userId);
    const now = new Date();
    for (const token of tokens) {
      if (token.revoked) continue;
      if (token.expiresAt! <= now) continue;

      if (token.token === refreshToken) {
        return true;
      }
    }

    return false;
  }

  async revokeRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const tokens = await this.tokenRepository.findByUserId(userId);

    for (const token of tokens) {
      if (refreshToken === token.token) {
        await this.tokenRepository.revokeToken(token.id!);
        return;
      }
    }

    throw new NotFoundException('Refresh token not found');
  }

  async revokeAllRefreshTokensForUser(userId: number): Promise<void> {
    await this.tokenRepository.revokeTokensForUser(userId, 'REFRESH');
  }
  async blacklistAccessToken(accessToken: string) {
    if (!accessToken) return;
    try {
      const decoded: any = this.jwtService.decode(accessToken) as any;
      if (!decoded || !decoded.exp) {
        await this.cacheManager.set(`bl:access:${accessToken}`, 'true', 300);
        return;
      }
      const expSec = Number(decoded.exp);
      const nowSec = Math.floor(Date.now() / 1000);
      const ttl = expSec - nowSec;
      if (ttl <= 0) return; // already expired
      await this.cacheManager.set(`bl:access:${accessToken}`, '1', ttl);
    } catch (e) {
      // best effort: fallback short ttl
      await this.cacheManager.set(`bl:access:${accessToken}`, 'true', 300);
    }
  }
  private calculateExpiry(expiry: string): Date {
    const now = new Date();
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const value = parseInt(match[1]!);
    const unit = match[2];

    switch (unit) {
      case 's':
        return new Date(now.getTime() + value * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    }
  }
}
