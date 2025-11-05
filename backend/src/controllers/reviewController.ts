import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Create review
 * POST /api/reviews
 */
export const createReview = asyncHandler(async (req: Request, res: Response) => {
    const { rating, comment, aspects, propertyId } = req.body;

    // Check if user already reviewed this property
    const existingReview = await prisma.review.findFirst({
        where: {
            userId: req.user!.id,
            propertyId
        }
    });

    if (existingReview) {
        throw new ApiError(400, 'You have already reviewed this property');
    }

    // Check if property exists
    const property = await prisma.property.findUnique({
        where: { id: propertyId }
    });

    if (!property) {
        throw new ApiError(404, 'Property not found');
    }

    // Create review
    const review = await prisma.review.create({
        data: {
            rating,
            comment,
            aspects,
            userId: req.user!.id,
            propertyId
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    profileImage: true
                }
            }
        }
    });

    res.status(201).json(
        ApiResponse.success(review, 'Review created successfully')
    );
});

/**
 * Get property reviews
 * GET /api/reviews/property/:propertyId
 */
export const getPropertyReviews = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.propertyId);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
        prisma.review.findMany({
            where: { propertyId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.review.count({
            where: { propertyId }
        })
    ]);

    // Calculate average rating
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json(
        ApiResponse.paginated(
            reviews,
            {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            'Reviews retrieved successfully'
        )
    );
});

/**
 * Update review
 * PUT /api/reviews/:id
 */
export const updateReview = asyncHandler(async (req: Request, res: Response) => {
    const reviewId = parseInt(req.params.id);
    const { rating, comment, aspects } = req.body;

    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new ApiError(404, 'Review not found');
    }

    if (review.userId !== req.user!.id) {
        throw new ApiError(403, 'Not authorized to update this review');
    }

    const updated = await prisma.review.update({
        where: { id: reviewId },
        data: {
            rating,
            comment,
            aspects
        }
    });

    res.json(
        ApiResponse.success(updated, 'Review updated successfully')
    );
});

/**
 * Delete review
 * DELETE /api/reviews/:id
 */
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
    const reviewId = parseInt(req.params.id);

    const review = await prisma.review.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new ApiError(404, 'Review not found');
    }

    if (review.userId !== req.user!.id) {
        throw new ApiError(403, 'Not authorized to delete this review');
    }

    await prisma.review.delete({
        where: { id: reviewId }
    });

    res.json(
        ApiResponse.success(null, 'Review deleted successfully')
    );
});

/**
 * Get user's reviews
 * GET /api/reviews/me
 */
export const getMyReviews = asyncHandler(async (req: Request, res: Response) => {
    const reviews = await prisma.review.findMany({
        where: { userId: req.user!.id },
        include: {
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json(
        ApiResponse.success(reviews, 'Your reviews retrieved successfully')
    );
});