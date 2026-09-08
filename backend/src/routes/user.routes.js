import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import authenticate from '../middleware/authenticate.js';
import authorize from '../middleware/authorize.js';

const router = Router();

// Profile routes (authenticated users)
router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);

// Admin user management routes
router.get('/pending', authenticate, authorize('admin'), userController.getPendingNgoApprovals);
router.get('/', authenticate, authorize('admin'), userController.getAllUsers);
router.patch('/:id/approve', authenticate, authorize('admin'), userController.approveNgo);

export default router;
