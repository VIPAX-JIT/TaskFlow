import { ITaskDocument } from '../models/Task';
import { TaskStatus } from '../types';

export interface ITaskRepository {
  findById(id: string): Promise<ITaskDocument | null>;
  findByProjectId(projectId: string): Promise<ITaskDocument[]>;
  findByAssignedTo(userId: string): Promise<ITaskDocument[]>;
  findOverdue(): Promise<ITaskDocument[]>;
  findByStatus(status: TaskStatus): Promise<ITaskDocument[]>;
  save(taskData: Partial<ITaskDocument>): Promise<ITaskDocument>;
  update(id: string, data: Partial<ITaskDocument>): Promise<ITaskDocument | null>;
  delete(id: string): Promise<void>;
}
