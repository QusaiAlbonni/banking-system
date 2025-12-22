import { PaginatedDto } from '@/common/dto';
import { Expose } from 'class-transformer';
import { NotificationResponseDto } from './response.dto';

@Expose()
export class PaginatedNotificaionResponseDto extends PaginatedDto(
  NotificationResponseDto,
) {}
