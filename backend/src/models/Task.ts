import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import { TaskStatus, Priority } from '../types';

export interface ITaskDocument extends Document {
  title: string;
  description?: string;
  projectId: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  status: TaskStatus;
  priority: Priority;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;

  transitionStatus(newStatus: TaskStatus): void;
  isOverdue(): boolean;            
  assign(memberId: string): void;  
  getDetails(): object;
  validateTransition(from: TaskStatus, to: TaskStatus): boolean;
}

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.DONE],
  [TaskStatus.DONE]: [],  
};

const taskSchema = new Schema<ITaskDocument>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      required: [true, 'Project ID is required'],
      ref: 'Project',
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: [true, 'Creator ID is required'],
      ref: 'User',
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
    },
    priority: {
      type: String,
      enum: Object.values(Priority),
      default: Priority.MEDIUM,
    },
    deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

taskSchema.methods.validateTransition = function (from: TaskStatus, to: TaskStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
};

taskSchema.methods.transitionStatus = function (newStatus: TaskStatus): void {
  if (!this.validateTransition(this.status, newStatus)) {
    throw new Error(`Invalid status transition: ${this.status} → ${newStatus}`);
  }
  this.status = newStatus;
};

taskSchema.methods.isOverdue = function (): boolean {
  if (!this.deadline) return false;
  return this.status !== TaskStatus.DONE && new Date() > new Date(this.deadline);
};

taskSchema.methods.assign = function (memberId: string): void {
  this.assignedTo = new mongoose.Types.ObjectId(memberId);
};

taskSchema.methods.getDetails = function (): object {
  return {
    _id: this._id,
    title: this.title,
    status: this.status,
    priority: this.priority,
    assignedTo: this.assignedTo,
    deadline: this.deadline,
    isOverdue: this.isOverdue(),
  };
};

const Task: Model<ITaskDocument> = mongoose.model<ITaskDocument>('Task', taskSchema);

export default Task;
