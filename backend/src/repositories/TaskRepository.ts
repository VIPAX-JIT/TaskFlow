import Task, { ITaskDocument } from '../models/Task';
import { ITaskRepository } from '../interfaces/ITaskRepository';
import { TaskStatus } from '../types';

class TaskRepository implements ITaskRepository {

  public async findById(id: string): Promise<ITaskDocument | null> {
    return Task.findById(id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
  }

  public async findByProjectId(projectId: string): Promise<ITaskDocument[]> {
    return Task.find({ projectId })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name');
  }

  public async findByAssignedTo(userId: string): Promise<ITaskDocument[]> {
    return Task.find({ assignedTo: userId })
      .populate('projectId', 'name')
      .populate('createdBy', 'name');
  }

  public async findOverdue(): Promise<ITaskDocument[]> {
    return Task.find({
      status: { $ne: TaskStatus.DONE },
      deadline: { $lt: new Date() },
    }).populate('assignedTo', 'name email');
  }

  public async findByStatus(status: TaskStatus): Promise<ITaskDocument[]> {
    return Task.find({ status });
  }

  public async save(taskData: Partial<ITaskDocument>): Promise<ITaskDocument> {
    return Task.create(taskData);
  }

  public async update(id: string, data: Partial<ITaskDocument>): Promise<ITaskDocument | null> {
    return Task.findByIdAndUpdate(id, data, { new: true, runValidators: true })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
  }

  public async delete(id: string): Promise<void> {
    await Task.findByIdAndDelete(id);
  }
}

export default new TaskRepository();
