import { Router } from 'express';
import {
    initiatePayment,
    mpesaCallback,
    queryPaymentStatus,
    getPaymentHistory,
    getPaymentById
} from '../controllers/paymentController';
import { authenticate } from '../middleware/auth';
import { validateInitiatePayment } from '../middleware/validator';

const router: Router = Router();

// Payment routes
router.post('/initiate', authenticate, validateInitiatePayment, initiatePayment);
router.post('/mpesa/callback', mpesaCallback); // No auth - M-Pesa callback
router.get('/history', authenticate, getPaymentHistory);
router.get('/:id/status', authenticate, queryPaymentStatus);
router.get('/:id', authenticate, getPaymentById);

export default router;