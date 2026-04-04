import Notification, { INotificationDocument } from '../models/Notification';
import { INotificationRepository } from '../interfaces/INotificationRepository';
import { NotificationType } from '../types';

class NotificationRepository implements INotificationRepository {

  public async findByUserId(userId: string): Promise<INotificationDocument[]> {
    return Notification.find({ userId }).sort({ createdAt: -1 });
  }

  public async findUnread(userId: string): Promise<INotificationDocument[]> {
    return Notification.find({ userId, isRead: false }).sort({ createdAt: -1 });
  }

  public async save(data: {
    userId: string;
    message: string;
    type: NotificationType;
  }): Promise<INotificationDocument> {
    return Notification.create(data);
  }

  public async markRead(id: string): Promise<INotificationDocument | null> {
    return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  }

  public async markAllRead(userId: string): Promise<number> {
    const result = await Notification.updateMany({ userId, isRead: false }, { isRead: true });
    return result.modifiedCount ?? 0;
  }
}

export default new NotificationRepository();
