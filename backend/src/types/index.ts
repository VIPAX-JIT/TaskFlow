

export enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum NotificationType {
  TASK_ASSIGNED = 'TASK_ASSIGNED',
  STATUS_CHANGED = 'STATUS_CHANGED',
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  token: string;
}

export interface AnalyticsResult {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  completionRate: number;
}

export interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export interface FilterCriteria {
  strategy: 'byStatus' | 'byPriority' | 'byAssignee' | 'overdue';
  value?: string;
}

export type SortStrategy = 'byDeadline' | 'byPriority' | 'byCreatedAt';
