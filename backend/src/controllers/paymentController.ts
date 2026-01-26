import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { MpesaService } from '../services/mpesaService';
import { prisma } from '../utils/prisma';

/**
 * Initiate M-Pesa payment
 * POST /api/payments/initiate
 * 
 * FIXED: Returns only payment object instead of full result to match frontend expectations
 */
export const initiatePayment = asyncHandler(async (req: Request, res: Response) => {
    const { amount, phoneNumber, propertyId, paymentType } = req.body;

    const result = await MpesaService.initiateSTKPush(
        phoneNumber,
        amount,
        propertyId,
        req.user!.id,
        paymentType
    );

    // FIXED: Return only the payment object for frontend consumption
    // The result contains: { checkoutRequestID, merchantRequestID, ..., payment }
    // Frontend expects the payment directly as response.data
    // This ensures response.data.id is the payment ID, not undefined
    res.status(201).json(
        ApiResponse.success(result.payment, 'Payment initiated successfully')
    );
});

/**
 * M-Pesa callback handler
 * POST /api/payments/mpesa/callback
 */
export const mpesaCallback = asyncHandler(async (req: Request, res: Response) => {
    await MpesaService.handleCallback(req.body);

    res.json(
        ApiResponse.success(null, 'Callback processed')
    );
});

/**
 * Query payment status
 * GET /api/payments/:id/status
 * 
 * FIXED: Improved validation and error messages
 */
export const queryPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id);

    // Validate payment ID format
    if (isNaN(paymentId) || paymentId <= 0) {
        return res.status(400).json(
            ApiResponse.error('Invalid payment ID. Payment ID must be a positive number.')
        );
    }

    // Find payment
    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
    });

    if (!payment) {
        return res.status(404).json(
            ApiResponse.error('Payment not found')
        );
    }

    // Authorization check
    if (payment.userId !== req.user!.id) {
        return res.status(403).json(
            ApiResponse.error('Not authorized to view this payment')
        );
    }

    console.log('Checking payment status:', {
        paymentId,
        status: payment.status,
        checkoutRequestID: payment.checkoutRequestID
    });

    // Check DB first - callbacks already update status
    if (payment.status === 'COMPLETED' || payment.status === 'FAILED') {
        return res.json(
            ApiResponse.success(
                { 
                    status: payment.status, 
                    mpesaReceiptNumber: payment.mpesaReceiptNumber,
                    id: payment.id,
                    amount: payment.amount,
                    createdAt: payment.createdAt
                },
                'Payment status from database'
            )
        );
    }

    // Only query M-Pesa if still pending and we have a checkoutRequestID
    if (!payment.checkoutRequestID) {
        return res.json(
            ApiResponse.success(
                { 
                    status: payment.status,
                    id: payment.id,
                    amount: payment.amount,
                    createdAt: payment.createdAt
                },
                'Payment is pending M-Pesa confirmation'
            )
        );
    }

    // Query M-Pesa for latest status
    try {
        const status = await MpesaService.queryPaymentStatus(payment.checkoutRequestID);
        
        return res.json(
            ApiResponse.success(
                { 
                    ...status, 
                    paymentId: payment.id,
                    amount: payment.amount 
                }, 
                'Payment status retrieved'
            )
        );
    } catch (error) {
        // If M-Pesa query fails, return DB status
        console.error('M-Pesa query failed, returning DB status:', error);
        return res.json(
            ApiResponse.success(
                { 
                    status: payment.status,
                    id: payment.id,
                    amount: payment.amount,
                    createdAt: payment.createdAt
                },
                'Payment status from database (M-Pesa query unavailable)'
            )
        );
    }
});

/**
 * Get user's payment history
 * GET /api/payments/history
 */
export const getPaymentHistory = asyncHandler(async (req: Request, res: Response) => {
    const payments = await prisma.payment.findMany({
        where: { userId: req.user!.id },
        include: {
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json(
        ApiResponse.success(payments, 'Payment history retrieved')
    );
});

/**
 * Get payment by ID
 * GET /api/payments/:id
 * 
 * FIXED: Improved validation and authorization
 */
export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id);

    // Validate payment ID format
    if (isNaN(paymentId) || paymentId <= 0) {
        return res.status(400).json(
            ApiResponse.error('Invalid payment ID. Payment ID must be a positive number.')
        );
    }

    const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true,
                    ownerId: true
                }
            }
        }
    });

    if (!payment) {
        return res.status(404).json(
            ApiResponse.error('Payment not found')
        );
    }

    // Ensure user can only view their own payments or is property owner
    if (payment.userId !== req.user!.id && payment.property.ownerId !== req.user!.id) {
        return res.status(403).json(
            ApiResponse.error('Not authorized to view this payment')
        );
    }

    return res.json(
        ApiResponse.success(payment, 'Payment retrieved')
    );
});