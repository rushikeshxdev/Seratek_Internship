import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  userId?: string;
  title: string;
  message: string;
  type?: NotificationType;
  broadcast?: boolean;
}

export class MarkAsReadDto {
  notificationId: string;
  userId: string;
}
