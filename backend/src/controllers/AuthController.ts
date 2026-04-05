import { Request, Response, NextFunction } from 'express';
import AuthService from '../services/AuthService';
import UserRepository from '../repositories/UserRepository';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const result = await AuthService.register(name, email, password, role);
    res.status(201).json(result);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401);
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {

    res.json((req as any).user);
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await UserRepository.findAll();
    res.json(users);
  } catch (error) {
    next(error);
  }
};
