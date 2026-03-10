import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType } from './schemas/notification.schema';
import { CreateNotificationDto } from './dto/create-notification.dto';

@Injectable()
export class NotificationService {
  private connectedUsers: Map<string, string> = new Map();

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async createNotification(dto: CreateNotificationDto): Promise<NotificationDocument> {
    const notification = new this.notificationModel({
      userId: dto.userId,
      title: dto.title,
      message: dto.message,
      type: dto.type || NotificationType.INFO,
      read: false,
      createdAt: new Date(),
    });

    return await notification.save();
  }

  async getPendingNotifications(userId: string): Promise<NotificationDocument[]> {
    return await this.notificationModel
      .find({ userId, read: false })
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllNotifications(userId: string): Promise<NotificationDocument[]> {
    return await this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async markAsRead(userId: string, notificationId: string): Promise<boolean> {
    const result = await this.notificationModel
      .updateOne({ _id: notificationId, userId }, { read: true })
      .exec();
    
    return result.modifiedCount > 0;
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.notificationModel
      .updateMany({ userId, read: false }, { read: true })
      .exec();
    
    return result.modifiedCount;
  }

  registerUser(userId: string, socketId: string): void {
    this.connectedUsers.set(userId, socketId);
  }

  unregisterUser(userId: string): void {
    this.connectedUsers.delete(userId);
  }

  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  getSocketId(userId: string): string | undefined {
    return this.connectedUsers.get(userId);
  }

  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  async clearNotifications(userId: string): Promise<void> {
    await this.notificationModel.deleteMany({ userId }).exec();
  }
}
