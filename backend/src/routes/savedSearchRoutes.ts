import { Router } from 'express';
import {
    createSavedSearch,
    getSavedSearches,
    updateSavedSearch,
    deleteSavedSearch
} from '../controllers/savedSearchController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', createSavedSearch);
router.get('/', getSavedSearches);
router.put('/:id', updateSavedSearch);
router.delete('/:id', deleteSavedSearch);

export default router;