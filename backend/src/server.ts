import express, { Application } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db';
import { errorHandler } from './middlewares/errorMiddleware';

import authRoutes from './routes/authRoutes';
import projectRoutes from './routes/projectRoutes';
import taskRoutes from './routes/taskRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import notificationRoutes from './routes/notificationRoutes';

dotenv.config();

const app: Application = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ message: 'TaskFlow API is running ✅', version: '2.0.0-typescript' });
});

app.use('/api/auth',          authRoutes);
app.use('/api/projects',      projectRoutes);
app.use('/api/tasks',         taskRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(errorHandler);

const PORT: number = parseInt(process.env.PORT ?? '5000', 10);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV ?? 'development'} mode on port ${PORT}`);
  });
});

export default app;
