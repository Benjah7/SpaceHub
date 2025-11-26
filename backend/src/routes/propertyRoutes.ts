import { Router } from 'express';
import {
    createProperty,
    getProperties,
    getPropertyById,
    updateProperty,
    deleteProperty,
    getMyProperties,
    uploadImages,
    deleteImage,
    setPrimaryImage
} from '../controllers/propertyController';
import { authenticate, authorize } from '../middleware/auth';
import { validateCreateProperty, validateUpdateProperty } from '../middleware/validator';
import { uploadPropertyImages } from '../middleware/upload';
import { cache, invalidateCache } from '../middleware/cache';
import { CACHE_DURATIONS } from '../utils/constants';
import { getPropertyInquiries } from '../controllers/inquiryController';

const router: Router = Router();

// Public routes
router.get('/', cache(CACHE_DURATIONS.MEDIUM), getProperties);
router.get('/:id', cache(CACHE_DURATIONS.MEDIUM), getPropertyById);

// Owner routes
router.post(
    '/',
    authenticate,
    authorize('OWNER', 'ADMIN'),
    validateCreateProperty,
    invalidateCache('cache:/api/properties*', 'cache:/api/search*'),
    createProperty
);

router.put(
    '/:id',
    authenticate,
    authorize('OWNER', 'ADMIN'),
    validateUpdateProperty,
    invalidateCache('cache:/api/properties*', 'cache:/api/search*'),
    updateProperty
);

router.delete(
    '/:id',
    authenticate,
    authorize('OWNER', 'ADMIN'),
    invalidateCache('cache:/api/properties*', 'cache:/api/search*'),
    deleteProperty
);

router.get(
    '/owner/me',
    authenticate,
    authorize('OWNER', 'ADMIN'),
    getMyProperties
);

// Image routes
router.post(
    '/:id/images',
    authenticate,
    authorize('OWNER', 'ADMIN'),
    uploadPropertyImages,
    uploadImages
);

router.delete(
    '/images/:imageId',
    authenticate,
    authorize('OWNER', 'ADMIN'),
    deleteImage
);

router.put(
    '/images/:imageId/primary',
    authenticate,
    authorize('OWNER', 'ADMIN'),
    setPrimaryImage
);

router.get(
    '/:propertyId/inquiries',
    authenticate,
    authorize('OWNER', 'ADMIN'),
    getPropertyInquiries
);

export default router;