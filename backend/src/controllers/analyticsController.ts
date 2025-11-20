import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { prisma } from '../utils/prisma';


/**
 * Get owner analytics dashboard
 * GET /api/analytics/dashboard
 */
export const getOwnerDashboard = asyncHandler(async (req: Request, res: Response) => {
    const ownerId = req.user!.id;

    // Get all properties for this owner
    const properties = await prisma.property.findMany({
        where: { ownerId },
        select: {
            id: true,
            propertyName: true,
            status: true,
            monthlyRent: true,
            views: true,
            _count: {
                select: {
                    inquiries: true,
                    favorites: true,
                    reviews: true
                }
            }
        }
    });

    // Calculate totals
    const totalProperties = properties.length;
    const availableProperties = properties.filter(p => p.status === 'AVAILABLE').length;
    const rentedProperties = properties.filter(p => p.status === 'RENTED').length;
    const totalViews = properties.reduce((sum, p) => sum + p.views, 0);
    const totalInquiries = properties.reduce((sum, p) => sum + p._count.inquiries, 0);
    const totalFavorites = properties.reduce((sum, p) => sum + p._count.favorites, 0);

    // Get recent inquiries
    const recentInquiries = await prisma.inquiry.findMany({
        where: { ownerId },
        include: {
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            property: {
                select: {
                    id: true,
                    propertyName: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    // Get payment history
    const payments = await prisma.payment.findMany({
        where: {
            property: {
                ownerId
            }
        },
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
                    propertyName: true
                }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    const totalRevenue = payments
        .filter(p => p.status === 'COMPLETED')
        .reduce((sum, p) => sum + Number(p.amount), 0);

    res.json(
        ApiResponse.success({
            summary: {
                totalProperties,
                availableProperties,
                rentedProperties,
                totalViews,
                totalInquiries,
                totalFavorites,
                totalRevenue
            },
            properties,
            recentInquiries,
            recentPayments: payments
        }, 'Analytics retrieved successfully')
    );
});

/**
 * Get property performance
 * GET /api/analytics/property/:id
 */
export const getPropertyAnalytics = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.id);

    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
            _count: {
                select: {
                    inquiries: true,
                    favorites: true,
                    reviews: true,
                    payments: true
                }
            }
        }
    });

    if (!property) {
        return res.status(404).json(
            ApiResponse.error('Property not found')
        );
    }

    if (property.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        return res.status(403).json(
            ApiResponse.error('Not authorized')
        );
    }

    // Get average rating
    const reviews = await prisma.review.findMany({
        where: { propertyId },
        select: { rating: true }
    });

    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return res.json(
        ApiResponse.success({
            property: {
                id: property.id,
                propertyName: property.propertyName,
                status: property.status,
                views: property.views,
                inquiryCount: property._count.inquiries,
                favoriteCount: property._count.favorites,
                reviewCount: property._count.reviews,
                paymentCount: property._count.payments,
                averageRating: Math.round(avgRating * 10) / 10
            }
        }, 'Property analytics retrieved successfully')
    );
});

/**
 * Get platform statistics (Admin only)
 * GET /api/analytics/platform
 */
export const getPlatformStats = asyncHandler(async (_req: Request, res: Response) => {
    const [
        totalUsers,
        totalProperties,
        totalInquiries,
        totalPayments,
        totalReviews
    ] = await Promise.all([
        prisma.user.count(),
        prisma.property.count(),
        prisma.inquiry.count(),
        prisma.payment.count(),
        prisma.review.count()
    ]);

    const completedPayments = await prisma.payment.findMany({
        where: { status: 'COMPLETED' },
        select: { amount: true }
    });

    const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);

    res.json(
        ApiResponse.success({
            totalUsers,
            totalProperties,
            totalInquiries,
            totalPayments,
            totalReviews,
            totalRevenue
        }, 'Platform statistics retrieved successfully')
    );
});