import { Router } from 'express';
import {
    uploadDocument,
    getDocuments,
    getPropertyDocuments,
    deleteDocument
} from '../controllers/documentController';
import { authenticate } from '../middleware/auth';
import { uploadDocument as uploadMiddleware } from '../middleware/upload';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

router.post('/', uploadMiddleware, uploadDocument);
router.get('/', getDocuments);
router.get('/property/:propertyId', getPropertyDocuments);
router.delete('/:id', deleteDocument);

export default router;