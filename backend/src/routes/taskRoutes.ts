import { Router } from 'express';
import {
  createTask,
  getProjectTasks,
  getMyTasks,
  updateTaskStatus,
  assignTask,
  filterTasks,
  sortTasks,
  updateTask,
  deleteTask,
  getTask,
} from '../controllers/TaskController';
import { protect, admin } from '../middlewares/authMiddleware';
import { validate, schemas } from '../middlewares/validate';

const router: Router = Router();

router.post('/', protect, admin, validate(schemas.createTask), createTask);

router.get('/my-tasks', protect, getMyTasks);

router.get('/project/:projectId', protect, getProjectTasks);

router.get('/project/:projectId/filter', protect, filterTasks);

router.get('/project/:projectId/sort', protect, sortTasks);

router.get('/:taskId', protect, getTask);

router.put('/:taskId/status', protect, validate(schemas.updateTaskStatus), updateTaskStatus);

router.patch('/:taskId/assign', protect, admin, validate(schemas.assignTask), assignTask);

router.put('/:taskId', protect, admin, validate(schemas.updateTask), updateTask);

router.delete('/:taskId', protect, admin, deleteTask);

export default router;
