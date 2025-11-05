import { Router } from 'express';
import {
    createInquiry,
    getMyInquiries,
    getReceivedInquiries,
    respondToInquiry,
    deleteInquiry
} from '../controllers/inquiryController';
import { authenticate, authorize } from '../middleware/auth';
import { validateCreateInquiry } from '../middleware/validator';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', validateCreateInquiry, createInquiry);
router.get('/', getMyInquiries);
router.get('/received', authorize('OWNER', 'ADMIN'), getReceivedInquiries);
router.put('/:id/respond', authorize('OWNER', 'ADMIN'), respondToInquiry);
router.delete('/:id', deleteInquiry);

export default router;