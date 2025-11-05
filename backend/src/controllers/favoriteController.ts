import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { PrismaClient } from '@prisma/client';
import { RedisService } from '../services/redisService';
import { CACHE_KEYS } from '../utils/constants';

const prisma = new PrismaClient();

/**
 * Add property to favorites
 * POST /api/favorites/:propertyId
 */
export const addFavorite = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.propertyId);

    // Check if property exists
    const property = await prisma.property.findUnique({
        where: { id: propertyId }
    });

    if (!property) {
        throw new ApiError(404, 'Property not found');
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
        where: {
            userId_propertyId: {
                userId: req.user!.id,
                propertyId
            }
        }
    });

    if (existing) {
        throw new ApiError(400, 'Property already in favorites');
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
        data: {
            userId: req.user!.id,
            propertyId
        }
    });

    // Invalidate cache
    await RedisService.del(CACHE_KEYS.USER_FAVORITES(req.user!.id));

    res.status(201).json(
        ApiResponse.success(favorite, 'Property added to favorites')
    );
});

/**
 * Remove property from favorites
 * DELETE /api/favorites/:propertyId
 */
export const removeFavorite = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.propertyId);

    const favorite = await prisma.favorite.findUnique({
        where: {
            userId_propertyId: {
                userId: req.user!.id,
                propertyId
            }
        }
    });

    if (!favorite) {
        throw new ApiError(404, 'Favorite not found');
    }

    await prisma.favorite.delete({
        where: {
            userId_propertyId: {
                userId: req.user!.id,
                propertyId
            }
        }
    });

    // Invalidate cache
    await RedisService.del(CACHE_KEYS.USER_FAVORITES(req.user!.id));

    res.json(
        ApiResponse.success(null, 'Property removed from favorites')
    );
});

/**
 * Get user's favorites
 * GET /api/favorites
 */
export const getFavorites = asyncHandler(async (req: Request, res: Response) => {
    const favorites = await prisma.favorite.findMany({
        where: { userId: req.user!.id },
        include: {
            property: {
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            verificationStatus: true
                        }
                    },
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    },
                    _count: {
                        select: {
                            reviews: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json(
        ApiResponse.success(
            favorites.map(f => f.property),
            'Favorites retrieved successfully'
        )
    );
});

/**
 * Check if property is favorited
 * GET /api/favorites/check/:propertyId
 */
export const checkFavorite = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.propertyId);

    const favorite = await prisma.favorite.findUnique({
        where: {
            userId_propertyId: {
                userId: req.user!.id,
                propertyId
            }
        }
    });

    res.json(
        ApiResponse.success({ isFavorited: !!favorite }, 'Favorite status checked')
    );
});