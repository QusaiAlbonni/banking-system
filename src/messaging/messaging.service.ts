import { MessagingPayload } from './message';
export abstract class MessagingService {
  abstract sendToUsers(payload: MessagingPayload, ids: number[]): Promise<void>;
  abstract sendToUser(payload: MessagingPayload, userId: number): Promise<void>;
}
