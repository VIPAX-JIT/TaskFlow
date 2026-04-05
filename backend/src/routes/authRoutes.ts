import { Router } from 'express';
import { register, login, getProfile, listUsers } from '../controllers/AuthController';
import { protect } from '../middlewares/authMiddleware';
import { validate, schemas } from '../middlewares/validate';

const router: Router = Router();

router.post('/register', validate(schemas.register), register);
router.post('/login', validate(schemas.login), login);
router.get('/profile', protect, getProfile);
router.get('/users', protect, listUsers);

export default router;
