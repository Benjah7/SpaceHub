import { Router } from 'express';
import {
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    uploadProfileImage,
    deleteAccount
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validator';
import { uploadProfileImage as uploadMiddleware } from '../middleware/upload';

const router: Router = Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);

// Protected routes
router.get('/me', authenticate, getProfile);
router.put('/me', authenticate, updateProfile);
router.post('/me/image', authenticate, uploadMiddleware, uploadProfileImage);
router.delete('/me', authenticate, deleteAccount);

export default router;