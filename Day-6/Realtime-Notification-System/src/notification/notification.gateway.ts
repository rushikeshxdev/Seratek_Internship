import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/create-notification.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly notificationService: NotificationService) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.server.emit('connectedUsers', {
      count: this.notificationService.getConnectedUsersCount(),
    });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    const userId = client.data.userId;
    if (userId) {
      this.notificationService.unregisterUser(userId);
    }
    this.server.emit('connectedUsers', {
      count: this.notificationService.getConnectedUsersCount(),
    });
  }

  @SubscribeMessage('register')
  async handleRegister(
    @MessageBody() data: { userId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const { userId } = data;
    client.data.userId = userId;
    this.notificationService.registerUser(userId, client.id);

    const pendingNotifications =
      await this.notificationService.getPendingNotifications(userId);

    client.emit('registered', {
      userId,
      message: 'Successfully registered',
      pendingNotifications,
    });

    console.log(`User registered: ${userId} with socket ${client.id}`);
    return { success: true, pendingCount: pendingNotifications.length };
  }

  @SubscribeMessage('sendNotification')
  async handleSendNotification(@MessageBody() dto: CreateNotificationDto) {
    if (dto.broadcast) {
      const notification = await this.notificationService.createNotification(dto);
      this.server.emit('notification', notification);
      return { success: true, broadcast: true };
    } else if (dto.userId) {
      const notification = await this.notificationService.createNotification(dto);
      const socketId = this.notificationService.getSocketId(dto.userId);

      if (socketId) {
        this.server.to(socketId).emit('notification', notification);
        return { success: true, delivered: true };
      } else {
        return { success: true, delivered: false, stored: true };
      }
    }
    return { success: false, error: 'Invalid notification data' };
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @MessageBody() data: { notificationId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.data.userId;
    if (!userId) {
      return { success: false, error: 'User not registered' };
    }

    const success = await this.notificationService.markAsRead(
      userId,
      data.notificationId,
    );
    return { success };
  }

  @SubscribeMessage('markAllAsRead')
  async handleMarkAllAsRead(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      return { success: false, error: 'User not registered' };
    }

    const count = await this.notificationService.markAllAsRead(userId);
    return { success: true, count };
  }

  @SubscribeMessage('getNotifications')
  async handleGetNotifications(@ConnectedSocket() client: Socket) {
    const userId = client.data.userId;
    if (!userId) {
      return { success: false, error: 'User not registered' };
    }

    const notifications = await this.notificationService.getAllNotifications(userId);
    return { success: true, notifications };
  }

  sendNotificationToUser(userId: string, notification: any) {
    const socketId = this.notificationService.getSocketId(userId);
    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
      return true;
    }
    return false;
  }

  broadcastNotification(notification: any) {
    this.server.emit('notification', notification);
  }
}
