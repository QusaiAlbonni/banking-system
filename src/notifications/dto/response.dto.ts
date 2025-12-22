import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class NotificationResponseDto {
  @Expose()
  id: number;

  @Expose()
  userId: number;

  @Expose()
  type?: string | null;

  @Expose()
  title: string;

  @Expose()
  body?: string | null;

  @Expose()
  isRead: boolean;

  @Expose()
  createdAt: Date;

  @Expose()
  data?: Record<string, any> | null;
}
