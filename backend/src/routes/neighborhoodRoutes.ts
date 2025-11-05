import { Router } from 'express';
import {
    getNeighborhoods,
    getNeighborhoodById,
    getNeighborhoodStats
} from '../controllers/neighborhoodController';
import { cache } from '../middleware/cache';
import { CACHE_DURATIONS } from '../utils/constants';

const router: Router = Router();

router.get('/', cache(CACHE_DURATIONS.VERY_LONG), getNeighborhoods);
router.get('/:id', cache(CACHE_DURATIONS.VERY_LONG), getNeighborhoodById);
router.get('/:name/stats', cache(CACHE_DURATIONS.MEDIUM), getNeighborhoodStats);

export default router;