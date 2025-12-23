import { NotificationsService } from '@/notifications/notifications.service';
import { TransactionCompletedEvent } from '@/transaction/domain/transaction-completed.event';
import { TransactionFailedEvent } from '@/transaction/domain/transaction-failed.event';
import { EventHandlerType, EventsHandler, IEventHandler } from '@nestjs/cqrs';

@EventsHandler(TransactionCompletedEvent, TransactionFailedEvent)
export class TransactionEventsHandler implements IEventHandler<
  TransactionCompletedEvent | TransactionFailedEvent
> {
  constructor(private readonly notificationService: NotificationsService) {}

  async handle(event: TransactionCompletedEvent | TransactionFailedEvent) {
    const ids = [];
    this.notificationService.notifyUsers(ids, {
      type: 'transaction',
      title: 'transaction happened',
    });
  }
}
    