import { Router } from 'express';
import {
    getPendingVerifications,
    getAllVerifications,
    getVerificationDetails,
    approveVerification,
    rejectVerification,
    requestVerification,
    getVerificationStats
} from '../controllers/verificationController';
import { authenticate, authorize } from '../middleware/auth';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Owner routes
router.post('/request', authorize('OWNER'), requestVerification);

// Admin routes
router.get('/pending', authorize('ADMIN'), getPendingVerifications);
router.get('/all', authorize('ADMIN'), getAllVerifications);
router.get('/stats', authorize('ADMIN'), getVerificationStats);
router.get('/:userId', authorize('ADMIN'), getVerificationDetails);
router.post('/:userId/approve', authorize('ADMIN'), approveVerification);
router.post('/:userId/reject', authorize('ADMIN'), rejectVerification);

export default router;