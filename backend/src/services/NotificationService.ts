import NotificationRepository from '../repositories/NotificationRepository';
import { INotificationDocument } from '../models/Notification';
import { NotificationType } from '../types';

class NotificationService {

  private readonly notifRepo = NotificationRepository;

  public async notify(
    userId: string,
    message: string,
    type: NotificationType
  ): Promise<INotificationDocument> {
    return this.notifRepo.save({ userId, message, type });
  }

  public async getNotifications(userId: string): Promise<INotificationDocument[]> {
    return this.notifRepo.findByUserId(userId);
  }

  public async getUnread(userId: string): Promise<INotificationDocument[]> {
    return this.notifRepo.findUnread(userId);
  }

  public async markRead(notificationId: string): Promise<INotificationDocument | null> {
    return this.notifRepo.markRead(notificationId);
  }

  public async markAllRead(userId: string): Promise<number> {
    return this.notifRepo.markAllRead(userId);
  }
}

export default new NotificationService();
