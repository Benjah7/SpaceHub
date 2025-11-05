import { Router } from 'express';
import {
    searchByRadius,
    searchByBounds,
    getNearbyProperties,
    calculateDistance
} from '../controllers/searchController';
import { validateSearch } from '../middleware/validator';
import { cache } from '../middleware/cache';
import { CACHE_DURATIONS } from '../utils/constants';

const router: Router = Router();

router.get('/radius', validateSearch, cache(CACHE_DURATIONS.MEDIUM), searchByRadius);
router.get('/bounds', validateSearch, cache(CACHE_DURATIONS.MEDIUM), searchByBounds);
router.get('/nearby/:propertyId', cache(CACHE_DURATIONS.MEDIUM), getNearbyProperties);
router.get('/distance', calculateDistance);

export default router;