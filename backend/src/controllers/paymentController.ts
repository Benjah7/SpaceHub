import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { MpesaService } from '../services/mpesaService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Initiate M-Pesa payment
 * POST /api/payments/initiate
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

    res.status(201).json(
        ApiResponse.success(result, 'Payment initiated successfully')
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
 * GET /api/payments/:checkoutRequestID/status
 */
export const queryPaymentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { checkoutRequestID } = req.params;

    const status = await MpesaService.queryPaymentStatus(checkoutRequestID);

    res.json(
        ApiResponse.success(status, 'Payment status retrieved')
    );
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
 */
export const getPaymentById = asyncHandler(async (req: Request, res: Response) => {
    const paymentId = parseInt(req.params.id);

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
            ApiResponse.error('Not authorized')
        );
    }

    return res.json(
        ApiResponse.success(payment, 'Payment retrieved')
    );
});