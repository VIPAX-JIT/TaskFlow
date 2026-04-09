import bcrypt from 'bcryptjs';
import User from '../models/User';
import Project from '../models/Project';
import ProjectMember from '../models/ProjectMember';
import Task from '../models/Task';
import Notification from '../models/Notification';
import { UserRole, TaskStatus, Priority, NotificationType } from '../types';

export const seedDatabase = async (): Promise<void> => {
  const existingAdmin = await User.findOne({ email: 'vipax@gmail.com' });
  if (existingAdmin) {
    console.log('🌱 Seed skipped — demo data already present.');
    return;
  }

  console.log('🌱 Seeding demo accounts, project, and tasks...');

  const [adminHash, memberHash] = await Promise.all([
    bcrypt.hash('vipax@1234', 10),
    bcrypt.hash('test_1234', 10),
  ]);

  const [admin, jatin] = await User.create([
    { name: 'VIPAX',       email: 'vipax@gmail.com', passwordHash: adminHash,  role: UserRole.ADMIN },
    { name: 'Jatin Bisen', email: 'jatin@gmail.com', passwordHash: memberHash, role: UserRole.MEMBER },
  ]);

  const project = await Project.create({
    name: 'TaskFlow Launch',
    description: 'Ship the first public release of TaskFlow, our team task management platform.',
    adminId: admin._id,
  });

  await ProjectMember.create([
    { projectId: project._id, userId: jatin._id },
  ]);

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const tasks = await Task.create([
    {
      title: 'Design landing page',
      description: 'Craft the hero section and feature grid for the marketing site.',
      projectId: project._id, createdBy: admin._id, assignedTo: jatin._id,
      status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH,
      deadline: new Date(now + 3 * day),
    },
    {
      title: 'Set up CI pipeline',
      description: 'GitHub Actions workflow for lint, test, build on PRs.',
      projectId: project._id, createdBy: admin._id, assignedTo: jatin._id,
      status: TaskStatus.TODO, priority: Priority.MEDIUM,
      deadline: new Date(now + 5 * day),
    },
    {
      title: 'Write user auth documentation',
      description: 'Document /api/auth endpoints, JWT format, and role model.',
      projectId: project._id, createdBy: admin._id, assignedTo: jatin._id,
      status: TaskStatus.DONE, priority: Priority.LOW,
      deadline: new Date(now - 2 * day),
    },
    {
      title: 'Fix overdue: data migration',
      description: 'Convert legacy flat user records to v2 schema.',
      projectId: project._id, createdBy: admin._id, assignedTo: jatin._id,
      status: TaskStatus.TODO, priority: Priority.HIGH,
      deadline: new Date(now - 1 * day),
    },
    {
      title: 'Prepare launch checklist',
      description: 'DNS, SSL, monitoring, backups, rollback plan.',
      projectId: project._id, createdBy: admin._id, assignedTo: jatin._id,
      status: TaskStatus.TODO, priority: Priority.MEDIUM,
      deadline: new Date(now + 7 * day),
    },
  ]);

  await Notification.create([
    {
      userId: jatin._id,
      message: `You have been assigned to task: "${tasks[0]?.title}"`,
      type: NotificationType.TASK_ASSIGNED,
    },
    {
      userId: jatin._id,
      message: `You have been assigned to task: "${tasks[1]?.title}"`,
      type: NotificationType.TASK_ASSIGNED,
    },
    {
      userId: admin._id,
      message: `Task "${tasks[2]?.title}" status changed to DONE`,
      type: NotificationType.STATUS_CHANGED,
      isRead: true,
    },
  ]);

  console.log('🌱 Seed complete. Login with vipax@gmail.com / vipax@1234 (admin) or jatin@gmail.com / test_1234 (member).');
};

export default seedDatabase;
