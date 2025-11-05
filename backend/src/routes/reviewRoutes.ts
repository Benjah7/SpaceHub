import { Router } from 'express';
import {
    createReview,
    getPropertyReviews,
    updateReview,
    deleteReview,
    getMyReviews
} from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { validateCreateReview } from '../middleware/validator';
import { cache } from '../middleware/cache';
import { CACHE_DURATIONS } from '../utils/constants';

const router: Router = Router();

// Public routes
router.get('/property/:propertyId', cache(CACHE_DURATIONS.LONG), getPropertyReviews);

// Protected routes
router.post('/', authenticate, validateCreateReview, createReview);
router.get('/me', authenticate, getMyReviews);
router.put('/:id', authenticate, updateReview);
router.delete('/:id', authenticate, deleteReview);

export default router;