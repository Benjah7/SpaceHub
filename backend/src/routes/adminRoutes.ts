import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getAdminPaymentAnalytics } from '../controllers/propertyPaymentController';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);


router.get('/payments',  authorize('ADMIN'), getAdminPaymentAnalytics);

export default router;