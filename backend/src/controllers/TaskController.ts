import { Request, Response, NextFunction } from 'express';
import TaskService from '../services/TaskService';
import { TaskStatus, FilterCriteria, SortStrategy } from '../types';

export const createTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const adminId = (req as any).user._id.toString();
    const { projectId, ...data } = req.body;
    const task = await TaskService.createTask(projectId, data, adminId);
    res.status(201).json(task);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const getProjectTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasks = await TaskService.getProjectTasks(req.params.projectId as string);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const getMyTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const tasks = await TaskService.getTasksByUser(userId);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

export const updateTaskStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { taskId } = req.params;
    const { status } = req.body as { status: TaskStatus };
    const task = await TaskService.updateStatus(taskId as string, status, userId);
    res.json(task);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const assignTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId } = req.params;
    const { assignedTo } = req.body as { assignedTo: string };
    const task = await TaskService.assignTask(taskId as string, assignedTo as string);
    res.json(task);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const filterTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId } = req.params;
    const criteria = req.query as unknown as FilterCriteria;
    const tasks = await TaskService.filterTasks(projectId as string, criteria);
    res.json(tasks);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const sortTasks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { projectId } = req.params;
    const { strategy } = req.query as { strategy: SortStrategy };
    const tasks = await TaskService.sortTasks(projectId as string, strategy);
    res.json(tasks);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const updateTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId } = req.params;
    const task = await TaskService.updateTask(taskId as string, req.body);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.json(task);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

export const deleteTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId } = req.params;
    await TaskService.deleteTask(taskId as string);
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId } = req.params;
    const task = await TaskService.getTaskById(taskId as string);
    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }
    res.json(task);
  } catch (error) {
    next(error);
  }
};
