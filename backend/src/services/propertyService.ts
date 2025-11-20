import { CreatePropertyDTO, UpdatePropertyDTO } from '../types';
import { RedisService } from './redisService';
import { CACHE_KEYS } from '../utils/constants';
import { prisma } from '../utils/prisma';
import { ApiError } from '../utils/apiResponse';

export class PropertyService {
    /**
     * Create new property
     */
    static async createProperty(data: CreatePropertyDTO, ownerId: number) {
        const property = await prisma.property.create({
            data: {
                propertyName: data.propertyName,
                address: data.address,
                neighborhood: data.neighborhood,
                longitude: data.longitude,
                latitude: data.latitude,
                monthlyRent: data.monthlyRent,
                squareFeet: data.squareFeet,
                bedrooms: data.bedrooms || 0,
                bathrooms: data.bathrooms || 0,
                description: data.description,
                amenities: data.amenities,
                propertyType: data.propertyType,
                ownerId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        verificationStatus: true,
                    },
                },
            },
        });

        // Invalidate cache
        await RedisService.invalidatePattern('cache:/api/properties*');
        await RedisService.invalidatePattern('cache:/api/search*');

        return property;
    }

    /**
     * Get property by ID
     */
    static async getPropertyById(propertyId: number, userId?: number) {
        // Try cache first
        const cacheKey = CACHE_KEYS.PROPERTY_DETAIL(propertyId);
        const cached = await RedisService.get(cacheKey);
        if (cached) {
            return JSON.parse(cached);
        }

        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        verificationStatus: true,
                        bio: true,
                        profileImage: true,
                    },
                },
                images: {
                    orderBy: { isPrimary: 'desc' },
                },
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                profileImage: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                },
                _count: {
                    select: {
                        inquiries: true,
                        favorites: true,
                        reviews: true,
                    },
                },
            },
        });

        if (!property) {
            throw new ApiError(404, 'Property not found');
        }

        // Increment view count
        await prisma.property.update({
            where: { id: propertyId },
            data: { views: { increment: 1 } },
        });

        // Check if favorited by user
        let isFavorited = false;
        if (userId) {
            const favorite = await prisma.favorite.findUnique({
                where: {
                    userId_propertyId: {
                        userId,
                        propertyId,
                    },
                },
            });
            isFavorited = !!favorite;
        }

        const result = {
            ...property,
            isFavorited,
            inquiryCount: property._count.inquiries,
            favoriteCount: property._count.favorites,
            reviewCount: property._count.reviews,
        };

        // Cache for 10 minutes
        await RedisService.set(cacheKey, JSON.stringify(result), 600);

        return result;
    }
    /**
         * Get all properties with pagination
         */
    static async getProperties(page: number = 1, limit: number = 20, filters: any = {}) {
        const skip = (page - 1) * limit;

        const where: any = {};

        // Apply filters
        if (filters.status) where.status = filters.status;
        if (filters.propertyType) where.propertyType = filters.propertyType;
        if (filters.neighborhood) where.neighborhood = filters.neighborhood;
        if (filters.ownerId) where.ownerId = filters.ownerId;
        if (filters.featured !== undefined) where.featured = filters.featured;

        // Price range filter
        if (filters.minRent || filters.maxRent) {
            where.monthlyRent = {};
            if (filters.minRent) where.monthlyRent.gte = filters.minRent;
            if (filters.maxRent) where.monthlyRent.lte = filters.maxRent;
        }

        // Get total count
        const total = await prisma.property.count({ where });

        // Get properties
        const properties = await prisma.property.findMany({
            where,
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
                        reviews: true,
                        favorites: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: filters.sortBy === 'price'
                ? { monthlyRent: filters.sortOrder || 'asc' }
                : { createdAt: 'desc' }
        });

        // Calculate average ratings
        const propertiesWithRatings = await Promise.all(
            properties.map(async (property) => {
                const reviews = await prisma.review.findMany({
                    where: { propertyId: property.id },
                    select: { rating: true }
                });

                const avgRating = reviews.length > 0
                    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                    : 0;

                return {
                    ...property,
                    averageRating: Math.round(avgRating * 10) / 10,
                    reviewCount: property._count.reviews
                };
            })
        );

        return {
            properties: propertiesWithRatings,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Update property
     */
    static async updateProperty(
        propertyId: number,
        data: UpdatePropertyDTO,
        userId: number
    ) {
        // Verify ownership
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
        });

        if (!property) {
            throw new ApiError(404, 'Property not found');
        }

        if (property.ownerId !== userId) {
            throw new ApiError(403, 'Not authorized to update this property');
        }

        const updated = await prisma.property.update({
            where: { id: propertyId },
            data,
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        verificationStatus: true,
                    },
                },
                images: true,
            },
        });

        // Invalidate cache
        await RedisService.del(CACHE_KEYS.PROPERTY_DETAIL(propertyId));
        await RedisService.invalidatePattern('cache:/api/properties*');

        return updated;
    }

    /**
     * Delete property
     */
    static async deleteProperty(propertyId: number, userId: number) {
        // Verify ownership
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
        });

        if (!property) {
            throw new ApiError(404, 'Property not found');
        }

        if (property.ownerId !== userId) {
            throw new ApiError(403, 'Not authorized to delete this property');
        }

        await prisma.property.delete({
            where: { id: propertyId },
        });

        // Invalidate cache
        await RedisService.del(CACHE_KEYS.PROPERTY_DETAIL(propertyId));
        await RedisService.invalidatePattern('cache:/api/properties*');
    }

    /**
     * Get owner's properties
     */
    static async getOwnerProperties(ownerId: number) {
        const properties = await prisma.property.findMany({
            where: { ownerId },
            include: {
                images: {
                    where: { isPrimary: true },
                    take: 1
                },
                _count: {
                    select: {
                        reviews: true,
                        inquiries: true,
                        favorites: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return properties;
    }
}