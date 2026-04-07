import mongoose from "mongoose";
import TaskRepository from '../repositories/TaskRepository';
import NotificationService from './NotificationService';
import { ITaskDocument } from '../models/Task';
import { FilterCriteria, NotificationType, SortStrategy, TaskStatus } from '../types';

type FilterFn = (tasks: ITaskDocument[], value?: string) => ITaskDocument[];

const filterStrategies: Record<string, FilterFn> = {
  byStatus:   (tasks, value) => tasks.filter(t => t.status === value),
  byPriority: (tasks, value) => tasks.filter(t => t.priority === value),
  byAssignee: (tasks, value) => tasks.filter(t => String(t.assignedTo) === String(value)),
  overdue:    (tasks)        => tasks.filter(t => t.isOverdue()),
};

type SortFn = (tasks: ITaskDocument[]) => ITaskDocument[];

const sortStrategies: Record<SortStrategy, SortFn> = {
  byDeadline:  (tasks) => [...tasks].sort((a, b) =>
    new Date(a.deadline ?? 0).getTime() - new Date(b.deadline ?? 0).getTime()),
  byPriority:  (tasks) => {
    const order: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return [...tasks].sort((a, b) => (order[a.priority] ?? 1) - (order[b.priority] ?? 1));
  },
  byCreatedAt: (tasks) => [...tasks].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
};

class TaskService {

  private readonly taskRepo = TaskRepository;
  private readonly notificationService = NotificationService;

  public async createTask(
    projectId: string,
    data: Partial<ITaskDocument>,
    adminId: string
  ): Promise<ITaskDocument> {
    const task = await this.taskRepo.save({ ...data, projectId: new mongoose.Types.ObjectId(projectId), createdBy: new mongoose.Types.ObjectId(adminId) } as unknown as Partial<ITaskDocument>);

    if (task.assignedTo) {
      await this.notificationService.notify(
        task.assignedTo.toString(),
        `You have been assigned to task: "${task.title}"`,
        NotificationType.TASK_ASSIGNED
      );
    }

    return task;
  }

  public async assignTask(taskId: string, memberId: string): Promise<ITaskDocument | null> {
    const task = await this.taskRepo.update(taskId, { assignedTo: new mongoose.Types.ObjectId(memberId) } as unknown as Partial<ITaskDocument>);
    if (!task) throw new Error('Task not found');

    await this.notificationService.notify(
      memberId,
      `You have been assigned to task: "${task.title}"`,
      NotificationType.TASK_ASSIGNED
    );

    return task;
  }

  public async updateStatus(
    taskId: string,
    newStatus: TaskStatus,
    userId: string
  ): Promise<ITaskDocument | null> {
    const task = await this.taskRepo.findById(taskId);
    if (!task) throw new Error('Task not found');

    if (!task.validateTransition(task.status, newStatus)) {
      throw new Error(`Invalid status transition: ${task.status} → ${newStatus}`);
    }

    const updated = await this.taskRepo.update(taskId, { status: newStatus } as Partial<ITaskDocument>);
    if (!updated) throw new Error('Failed to update task');

    
    const rawCreator = updated.createdBy as unknown as { _id?: unknown } | mongoose.Types.ObjectId | undefined;
    const creatorId = rawCreator && typeof rawCreator === 'object' && '_id' in rawCreator
      ? String((rawCreator as { _id: unknown })._id)
      : rawCreator
      ? String(rawCreator)
      : null;

    if (creatorId && creatorId !== userId) {
      await this.notificationService.notify(
        creatorId,
        `Task "${updated.title}" status changed to ${newStatus}`,
        NotificationType.STATUS_CHANGED
      );
    }

    return updated;
  }

  public async getProjectTasks(projectId: string): Promise<ITaskDocument[]> {
    return this.taskRepo.findByProjectId(projectId);
  }

  public async getTasksByUser(userId: string): Promise<ITaskDocument[]> {
    return this.taskRepo.findByAssignedTo(userId);
  }

  public async filterTasks(
    projectId: string,
    criteria: FilterCriteria
  ): Promise<ITaskDocument[]> {
    const tasks = await this.taskRepo.findByProjectId(projectId);
    const strategyFn = filterStrategies[criteria.strategy];
    if (!strategyFn) throw new Error(`Unknown filter strategy: ${criteria.strategy}`);
    return strategyFn(tasks, criteria.value);
  }

  public async sortTasks(
    projectId: string,
    strategy: SortStrategy
  ): Promise<ITaskDocument[]> {
    const tasks = await this.taskRepo.findByProjectId(projectId);
    const strategyFn = sortStrategies[strategy];
    if (!strategyFn) throw new Error(`Unknown sort strategy: ${strategy}`);
    return strategyFn(tasks);
  }

  public async updateTask(
    taskId: string,
    data: Partial<ITaskDocument>
  ): Promise<ITaskDocument | null> {
    return this.taskRepo.update(taskId, data);
  }

  public async deleteTask(taskId: string): Promise<void> {
    await this.taskRepo.delete(taskId);
  }

  public async getTaskById(taskId: string): Promise<ITaskDocument | null> {
    return this.taskRepo.findById(taskId);
  }
}

export default new TaskService();
