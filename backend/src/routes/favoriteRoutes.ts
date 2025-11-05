import { Router } from 'express';
import {
    addFavorite,
    removeFavorite,
    getFavorites,
    checkFavorite
} from '../controllers/favoriteController';
import { authenticate } from '../middleware/auth';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getFavorites);
router.post('/:propertyId', addFavorite);
router.delete('/:propertyId', removeFavorite);
router.get('/check/:propertyId', checkFavorite);

export default router;