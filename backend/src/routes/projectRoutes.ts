import { Router } from 'express';
import {
  createProject,
  getMyProjects,
  getProjectDetails,
  addMember,
  removeMember,
  deleteProject,
} from '../controllers/ProjectController';
import { protect, admin } from '../middlewares/authMiddleware';
import { validate, schemas } from '../middlewares/validate';

const router: Router = Router();

router.route('/')
  .get(protect, getMyProjects)
  .post(protect, admin, validate(schemas.createProject), createProject);

router.get('/:id', protect, getProjectDetails);

router.delete('/:id', protect, admin, deleteProject);

router.post('/:id/members', protect, admin, validate(schemas.addMember), addMember);
router.delete('/:id/members/:userId', protect, admin, removeMember);

export default router;
