import { INotificationDocument } from '../models/Notification';
import { NotificationType } from '../types';

export interface INotificationRepository {
  findByUserId(userId: string): Promise<INotificationDocument[]>;
  findUnread(userId: string): Promise<INotificationDocument[]>;
  save(data: { userId: string; message: string; type: NotificationType }): Promise<INotificationDocument>;
  markRead(id: string): Promise<INotificationDocument | null>;
  markAllRead(userId: string): Promise<number>;
}
