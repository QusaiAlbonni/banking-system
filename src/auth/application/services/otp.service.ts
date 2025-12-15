import { EmailService } from '@/email/email.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import * as crypto from 'crypto';
export interface Otp {
  code: string;
  verified: boolean;
}
@Injectable()
export class OtpService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly emailService: EmailService,
  ) { }

  async generateOtp(
    ttl: number,
    length: number,
    key: string,
  ): Promise<Otp | null> {
    let otp: Otp | null = {
      code: this.generateCode(length),
      verified: false,
    };
    otp = await this.storeOtp(key, otp, ttl);
    console.log(otp);
    return otp;
  }

  generateCode(length: number): string {
    return crypto.randomInt(10 ** (length - 1), 10 ** length).toString();
  }

  async storeOtp(key: string, otp: Otp, ttl: number): Promise<Otp | null> {
    console.log("stored Otp", otp, " key ", key)
    return await this.cacheManager.set(key, otp, ttl);
  }

  async verifyOtp(candidate: string, key: string): Promise<boolean> {
    console.log("verifying Otp", candidate, " key ", key);
    const otp = await this.getOtp(key);
    console.log(otp);
    if (!otp) {
      return false;
    }
    return candidate === otp.code;
  }

  async markAsVerified(key: string, ttl: number) {
    const otp = await this.getOtp(key);
    if (!otp) {
      return null;
    }
    if (otp.verified) {
      throw new Error('OTP is already verified');
    }
    otp.verified = true;
    return await this.storeOtp(key, otp, ttl);
  }

  async sendOtp(otp: Otp, email: string): Promise<any> {
    return this.emailService.sendActivationEmail(email, otp.code);
  }

  async getOtp(key: string): Promise<Otp | null> {
    return await this.cacheManager.get(key);
  }

  async deleteOtp(key: string): Promise<boolean> {
    return await this.cacheManager.del(key);
  }
}
