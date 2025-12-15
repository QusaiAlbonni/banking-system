import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class EmailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {}

  async sendActivationEmail(email: string, code: string): Promise<void> {
    try {
      const appName = 'Rahhal';

      await this.mailerService.sendMail({
        from: 'Bank Rahhal',
        to: email,
        subject: `Account Activation Code - ${appName}`,
        // text: `Your Activation Code is:${code}`,
        template: 'activation',
        context: {
          code,
          appName,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to send activation code');
      [];
    }
  }
  async sendTemporaryPasswordEmail(email: string, password: string): Promise<void> {
    try {
      const appName = 'Complaints';
      await this.mailerService.sendMail({
        from: 'Complaints Team',
        to: email,
        subject: `Temporary Password - ${appName}`,
        html: `
          <p>Hello,</p>
          <p>Your temporary password is:</p>
          <p><strong>${password}</strong></p>
          <p>Please sign in using this password and update it immediately.</p>
          <p>— ${appName} Team</p>
        `,
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to send temporary password email');
    }
  }
}
