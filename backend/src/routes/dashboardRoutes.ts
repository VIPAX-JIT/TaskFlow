import { Router } from 'express';
import { getProjectAnalytics, getMyAnalytics } from '../controllers/DashboardController';
import { protect } from '../middlewares/authMiddleware';

const router: Router = Router();

router.get('/me', protect, getMyAnalytics);

router.get('/:projectId', protect, getProjectAnalytics);

export default router;
