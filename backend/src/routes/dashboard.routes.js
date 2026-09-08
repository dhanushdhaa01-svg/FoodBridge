import { Router } from 'express';
import dashboardController from '../controllers/dashboard.controller.js';
import authenticate from '../middleware/authenticate.js';

const router = Router();

// GET /api/v1/dashboard or /api/v1/dashboard/stats
router.get('/', authenticate, dashboardController.getDashboardStats);
router.get('/stats', authenticate, dashboardController.getDashboardStats);

export default router;
