import { Router } from 'express';
import {
    getOwnerDashboard,
    getPropertyAnalytics,
    getPlatformStats
} from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/dashboard', authorize('OWNER', 'ADMIN'), getOwnerDashboard);
router.get('/property/:id', authorize('OWNER', 'ADMIN'), getPropertyAnalytics);
router.get('/platform', authorize('ADMIN'), getPlatformStats);

export default router;