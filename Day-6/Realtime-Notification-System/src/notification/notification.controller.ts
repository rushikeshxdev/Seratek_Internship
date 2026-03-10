import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post()
  async createNotification(@Body() dto: CreateNotificationDto) {
    const notification = await this.notificationService.createNotification(dto);

    if (dto.broadcast) {
      this.notificationGateway.broadcastNotification(notification);
      return {
        success: true,
        message: 'Notification broadcasted to all users',
        notification,
      };
    } else if (dto.userId) {
      const delivered = this.notificationGateway.sendNotificationToUser(
        dto.userId,
        notification,
      );
      return {
        success: true,
        message: delivered
          ? 'Notification sent to user'
          : 'Notification stored for offline user',
        notification,
        delivered,
      };
    }

    return {
      success: false,
      message: 'Invalid notification data',
    };
  }

  @Get('user/:userId')
  async getUserNotifications(@Param('userId') userId: string) {
    const notifications = await this.notificationService.getAllNotifications(userId);
    return {
      success: true,
      userId,
      count: notifications.length,
      notifications,
    };
  }

  @Get('user/:userId/pending')
  async getPendingNotifications(@Param('userId') userId: string) {
    const notifications =
      await this.notificationService.getPendingNotifications(userId);
    return {
      success: true,
      userId,
      count: notifications.length,
      notifications,
    };
  }

  @Patch('user/:userId/:notificationId/read')
  async markAsRead(
    @Param('userId') userId: string,
    @Param('notificationId') notificationId: string,
  ) {
    const success = await this.notificationService.markAsRead(userId, notificationId);
    return {
      success,
      message: success
        ? 'Notification marked as read'
        : 'Notification not found',
    };
  }

  @Patch('user/:userId/read-all')
  async markAllAsRead(@Param('userId') userId: string) {
    const count = await this.notificationService.markAllAsRead(userId);
    return {
      success: true,
      message: `${count} notifications marked as read`,
      count,
    };
  }

  @Delete('user/:userId')
  async clearNotifications(@Param('userId') userId: string) {
    await this.notificationService.clearNotifications(userId);
    return {
      success: true,
      message: 'All notifications cleared',
    };
  }

  @Get('stats')
  getStats() {
    return {
      success: true,
      connectedUsers: this.notificationService.getConnectedUsersCount(),
      timestamp: new Date().toISOString(),
    };
  }
}
