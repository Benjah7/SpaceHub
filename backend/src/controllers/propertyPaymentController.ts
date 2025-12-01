import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { prisma } from '../utils/prisma';

/**
 * Get payments for a specific property (for property owners)
 * GET /api/properties/:id/payments
 */
export const getPropertyPayments = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.id);

    // Check property ownership
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { ownerId: true }
    });

    if (!property) {
        return res.status(404).json(ApiResponse.error('Property not found'));
    }

    if (property.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return res.status(403).json(ApiResponse.error('Not authorized'));
    }

    const payments = await prisma.payment.findMany({
        where: { propertyId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return res.json(ApiResponse.success(payments, 'Property payments retrieved'));
});

/**
 * Get admin payment analytics
 * GET /api/admin/payments?filter=all|today|week|month
 */
export const getAdminPaymentAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const { filter = 'all' } = req.query;
    
    // Date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    let dateFilter = {};
    if (filter === 'today') {
        dateFilter = { gte: today };
    } else if (filter === 'week') {
        dateFilter = { gte: weekAgo };
    } else if (filter === 'month') {
        dateFilter = { gte: monthStart };
    }

    const whereClause = Object.keys(dateFilter).length > 0 
        ? { createdAt: dateFilter }
        : {};

    // Fetch payments
    const payments = await prisma.payment.findMany({
        where: whereClause,
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
                    ownerId: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    // Calculate stats
    const stats = {
        totalRevenue: payments
            .filter(p => p.status === 'COMPLETED')
            .reduce((sum, p) => sum + p.amount.toNumber(), 0),
        completedPayments: payments.filter(p => p.status === 'COMPLETED').length,
        failedPayments: payments.filter(p => p.status === 'FAILED').length,
        pendingPayments: payments.filter(p => p.status === 'PENDING').length,
        todayRevenue: payments
            .filter(p => p.status === 'COMPLETED' && p.createdAt >= today)
            .reduce((sum, p) => sum + p.amount.toNumber(), 0),
        monthRevenue: payments
            .filter(p => p.status === 'COMPLETED' && p.createdAt >= monthStart)
            .reduce((sum, p) => sum + p.amount.toNumber(), 0)
    };

    res.json(ApiResponse.success({ stats, payments }, 'Analytics retrieved'));
});