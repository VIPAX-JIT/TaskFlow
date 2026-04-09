import TaskRepository from '../repositories/TaskRepository';
import { ITaskDocument } from '../models/Task';
import { AnalyticsResult } from '../types';

class DashboardService {

  private readonly taskRepo = TaskRepository;

  public async getAnalytics(projectId: string): Promise<AnalyticsResult> {
    const tasks = await this.taskRepo.findByProjectId(projectId);

    return {
      totalTasks:      tasks.length,
      completedTasks:  this.countCompleted(tasks),
      overdueTasks:    this.countOverdue(tasks),
      inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      todoTasks:       tasks.filter(t => t.status === 'TODO').length,
      completionRate:  this.calcCompletionRate(tasks),
    };
  }

  public async getUserAnalytics(userId: string): Promise<AnalyticsResult> {
    const tasks = await this.taskRepo.findByAssignedTo(userId);

    return {
      totalTasks:      tasks.length,
      completedTasks:  this.countCompleted(tasks),
      overdueTasks:    this.countOverdue(tasks),
      inProgressTasks: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      todoTasks:       tasks.filter(t => t.status === 'TODO').length,
      completionRate:  this.calcCompletionRate(tasks),
    };
  }

  private countCompleted(tasks: ITaskDocument[]): number {
    return tasks.filter(t => t.status === 'DONE').length;
  }

  private countOverdue(tasks: ITaskDocument[]): number {
    return tasks.filter(t => t.isOverdue()).length;
  }

  private calcCompletionRate(tasks: ITaskDocument[]): number {
    if (tasks.length === 0) return 0;
    return Math.round((this.countCompleted(tasks) / tasks.length) * 100);
  }
}

export default new DashboardService();
