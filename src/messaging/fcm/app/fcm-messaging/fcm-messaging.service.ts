import { MessagingPayload } from '@/messaging/message';
import { MessagingService } from '@/messaging/messaging.service';
import { Inject, Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { FcmService } from '../fcm.service';
import { FirebaseService } from '../firebase/firebase.service';

export const FCM_BATCH_SIZE = 100;
export const FCM_FAILURES_LOG_COUNT_PER_BATCH = 1;

@Injectable()
export class FcmMessagingService implements MessagingService {
  constructor(
    private readonly fcmService: FcmService,
    private readonly firebaseService: FirebaseService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  private chunkArray<T>(arr: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  }

  public async sendToDevices(payload: MessagingPayload, ids: number[]) {
    const tokens = await this.getValidTokens(ids);
    if (!tokens.length) return this.noDevicesResponse();

    const batches = this.chunkArray(tokens, FCM_BATCH_SIZE);
    const results = await this.sendAllBatches(payload, batches);
    this.logTotals(results);
    return results;
  }

  private async getValidTokens(ids: number[]): Promise<string[]> {
    const devices = await this.fcmService.findByUserIds(ids);
    if (!devices.length) {
      this.logger.info('No FCM devices found');
      return [];
    }
    return devices.map((d) => d.registrationId).filter(Boolean);
  }

  private noDevicesResponse() {
    return { successCount: 0, failureCount: 0 };
  }

  private buildMessage(
    payload: MessagingPayload,
    tokens: string[],
  ): admin.messaging.MulticastMessage {
    const data = { ...payload.data };
    if (payload.type) data['type'] = payload.type;
    return {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body ? payload.body : undefined,
      },
      data: data,
      android: { priority: 'high' },
      apns: { headers: { 'apns-priority': '10' } },
    };
  }

  private async sendBatch(
    payload: MessagingPayload,
    tokens: string[],
  ): Promise<{ success: number; failure: number }> {
    const message = this.buildMessage(payload, tokens);
    try {
      const resp = await this.firebaseService.sendMulticast(message);

      const failedTokens = resp.responses
        .map((r, i) =>
          !r.success ? { token: tokens[i], error: r.error } : null,
        )
        .filter(Boolean) as { token: string; error: any }[];

      if (failedTokens.length) {
        this.logger.warn(
          `FCM: Batch had ${failedTokens.length} failures out of ${tokens.length} tokens`,
        );

        failedTokens.slice(0, 1).forEach((f, idx) => {
          this.logger.warn(
            `FCM: Failure ${idx + FCM_FAILURES_LOG_COUNT_PER_BATCH}: token=${f.token}, error=${f.error?.message ?? f.error}`,
          );
        });

        if (failedTokens.length > 5) {
          this.logger.warn(
            `FCM: ...and ${failedTokens.length - FCM_FAILURES_LOG_COUNT_PER_BATCH} more failures.`,
          );
        }
      }

      return { success: resp.successCount, failure: resp.failureCount };
    } catch (err) {
      this.logger.error('FCM: Batch send fatal error', err);
      return { success: 0, failure: tokens.length };
    }
  }

  private async sendAllBatches(
    payload: MessagingPayload,
    batches: string[][],
  ): Promise<{ successCount: number; failureCount: number }> {
    let successCount = 0;
    let failureCount = 0;

    for (const batch of batches) {
      const { success, failure } = await this.sendBatch(payload, batch);
      successCount += success;
      failureCount += failure;
    }

    return { successCount, failureCount };
  }

  private logTotals({
    successCount,
    failureCount,
  }: {
    successCount: number;
    failureCount: number;
  }) {
    this.logger.info(
      `FCM: complete — ${successCount} sent, ${failureCount} failed`,
    );
  }

  async sendToUsers(payload: MessagingPayload, ids: number[]): Promise<void> {
    await this.sendToDevices(payload, ids);
  }

  async sendToUser(payload: MessagingPayload, userId: number): Promise<void> {
    await this.sendToDevices(payload, [userId]);
  }
}
