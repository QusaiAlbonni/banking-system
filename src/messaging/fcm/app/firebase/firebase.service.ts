import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class FirebaseService {
  constructor(
    private readonly configService: ConfigService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      const firebaseCredsJson =
        this.configService.get<string>('FIREBASE_CREDS') || '';
      const certs = JSON.parse(firebaseCredsJson);
      admin.initializeApp({
        credential: admin.credential.cert(certs),
      });
      this.logger.info('Firebase Admin SDK initialized');
    } catch (error) {
      this.logger.error('Error initializing Firebase Admin SDK', error);
    }
  }

  async sendMessage(message: admin.messaging.Message): Promise<string> {
    try {
      return await admin.messaging().send(message);
    } catch (error) {
      this.logger.error('FCM: Error sending message', error);
      throw error;
    }
  }

  async sendMulticast(
    message: admin.messaging.MulticastMessage,
  ): Promise<admin.messaging.BatchResponse> {
    try {
      return await admin.messaging().sendEachForMulticast(message);
    } catch (error) {
      this.logger.error('FCM: Error sending multicast message', error);
      throw error;
    }
  }

  async sendTestMessage(message: admin.messaging.Message): Promise<string> {
    try {
      return await admin.messaging().send(message, true);
    } catch (error) {
      this.logger.warn('FCM: Error sending Test Message', error);
      throw error;
    }
  }
}
