import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { JwtPayload } from '../types';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401);
    return next(new Error('Not authorized, no token'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      res.status(401);
      return next(new Error('Not authorized, user not found'));
    }

    (req as any).user = user;
    next();
  } catch {
    res.status(401);
    next(new Error('Not authorized, token failed'));
  }
};

export const admin = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as any).user;

  if (user && user.role === 'ADMIN') {
    next();
  } else {
    res.status(403);
    next(new Error('Not authorized as an admin'));
  }
};
