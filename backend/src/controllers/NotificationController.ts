import { Request, Response, NextFunction } from 'express';
import NotificationService from '../services/NotificationService';

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const notifications = await NotificationService.getNotifications(userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const notifications = await NotificationService.getUnread(userId);
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notification = await NotificationService.markRead(req.params.id as string);
    res.json(notification);
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const count = await NotificationService.markAllRead(userId);
    res.json({ message: 'All notifications marked as read', count });
  } catch (error) {
    next(error);
  }
};
