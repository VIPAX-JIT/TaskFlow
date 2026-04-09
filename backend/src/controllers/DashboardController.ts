import { Request, Response, NextFunction } from 'express';
import DashboardService from '../services/DashboardService';

export const getProjectAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const analytics = await DashboardService.getAnalytics(req.params.projectId as string);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

export const getMyAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const analytics = await DashboardService.getUserAnalytics(userId);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};
