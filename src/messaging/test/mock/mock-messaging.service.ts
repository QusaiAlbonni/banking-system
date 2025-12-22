import { MessagingPayload } from '@/messaging/message';
import { MessagingService } from '@/messaging/messaging.service';
import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class MockMessagingService implements MessagingService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async sendToUsers(payload: MessagingPayload, ids: number[]): Promise<void> {
    this.logger.info('MockMessagingService: sendToUsers called', {
      payload: {
        title: payload.title,
        body: payload.body,
        type: payload.type,
        data: payload.data,
      },
      userIds: ids,
      userCount: ids.length,
    });
    return Promise.resolve();
  }

  async sendToUser(payload: MessagingPayload, userId: number): Promise<void> {
    this.logger.info('MockMessagingService: sendToUser called', {
      payload: {
        title: payload.title,
        body: payload.body,
        type: payload.type,
        data: payload.data,
      },
      userId,
    });
    return Promise.resolve();
  }
}

