import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { NotificationQueryDto, PaginatedNotificaionResponseDto } from './dto';
import { IPaginationOptions, paginate } from 'nestjs-typeorm-paginate';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { DEFAULT_LANG } from '@/common/constant';
import { resolveLocalizedString } from '@/translations/helpers';
import { RequireOnly } from '@/common/utils';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { MessagingService } from '@/messaging/messaging.service';
import { UserEntity } from '@/user/infrastructure/orm/entities/user.entity';
import { NotificationEntity } from './entities/notification.entity';
import { I18nMessagingPayload, MessagingPayload } from '@/messaging/message';

const NOTIFICATION_CREATION_BATCH_SIZE = 100;

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notifRepository: Repository<NotificationEntity>,
    private readonly messagingService: MessagingService,
    private readonly i18n: I18nService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getUsersNotifications(
    userId: number,
    query: NotificationQueryDto,
    url: string,
  ) {
    const paginatedResult = await paginate(
      this.notifRepository,
      { ...query, route: url } as IPaginationOptions,
      { where: { userId }, order: { id: 'DESC' } },
    );

    return plainToInstance(PaginatedNotificaionResponseDto, paginatedResult);
  }

  async notifyUser(
    userId: number,
    message: MessagingPayload,
    lang: string = DEFAULT_LANG,
  ) {
    const notif = await this.create(userId, message);
    await this.messagingService.sendToUser(message, userId);
    return notif;
  }

  async create(
    userId: number,
    message: MessagingPayload,
  ): Promise<NotificationEntity> {
    const notif = this.notifRepository.create({ userId, ...message });
    return await this.notifRepository.save(notif);
  }

  /**
   *
   * @param condition The Condition that specifies which users to notify
   * @param message The message to send
   * @param lang the Lang
   * NOTE: this method is simplified it assumes the same language for all users
   */
  async notifyUsers(condition: number[], message: MessagingPayload) {
    await this.batchNotify(condition, message);
  }

  async batchNotify(
    userCondition: number[],
    message: MessagingPayload,
    batchSize: number = NOTIFICATION_CREATION_BATCH_SIZE,
  ) {
    const promises: Promise<unknown>[] = [];

    for (let i = 0; i < userCondition.length; i += batchSize) {
      const batch = userCondition.slice(i, i + batchSize);
      const p = this.bulkCreate(
        userCondition.map((id) => {
          return { id };
        }),
        message,
      )
        .then(
          async () => await this.messagingService.sendToUsers(message, batch),
        )
        .catch((e) => {
          this.logger.warn({
            message: 'an issue occured while batching notification creation',
            error: e,
          });
        });
      promises.push(p);
    }

    await Promise.all(promises);
  }

  async bulkCreate(
    users: RequireOnly<UserEntity, 'id'>[],
    message: MessagingPayload,
  ) {
    const notifs: NotificationEntity[] = [];
    for (let user of users) {
      notifs.push(this.notifRepository.create({ userId: user.id, ...message }));
    }
    return await this.notifRepository.insert(notifs);
  }

  resolveI18nMessagingPayload(
    payload: I18nMessagingPayload,
    lang: string,
  ): MessagingPayload {
    const resolvedTitle = resolveLocalizedString(
      this.i18n,
      payload.title,
      lang,
    );

    const resolvedBody = payload.body
      ? resolveLocalizedString(this.i18n, payload.body, lang)
      : null;

    return {
      title: resolvedTitle,
      body: resolvedBody,
      type: payload.type ?? null,
      data: payload.data ?? null,
    };
  }
}
