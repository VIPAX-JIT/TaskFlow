import { Router } from 'express';
import {
  getMyNotifications,
  getUnreadNotifications,
  markNotificationRead,
  markAllRead,
} from '../controllers/NotificationController';
import { protect } from '../middlewares/authMiddleware';

const router: Router = Router();

router.get('/', protect, getMyNotifications);

router.get('/unread', protect, getUnreadNotifications);

router.patch('/read-all', protect, markAllRead);
router.put('/read-all', protect, markAllRead);

router.patch('/:id/read', protect, markNotificationRead);
router.put('/:id/read', protect, markNotificationRead);

export default router;
