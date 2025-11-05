import { PrismaClient, Prisma } from '@prisma/client';
import { ApiError } from '../utils/apiResponse';
import { CreatePropertyDTO, UpdatePropertyDTO } from '../types';
import { RedisService } from './redisService';
import { CACHE_KEYS } from '../utils/constants';

const prisma = new PrismaClient();

export class PropertyService {
    /**
     * Create new property
     */
    static async createProperty(data: CreatePropertyDTO, ownerId: number) {
        // Create property with location
        const property = await prisma.$queryRaw<any[]>`
      INSERT INTO properties (
        "propertyName", address, neighborhood, location, longitude, latitude,
        "monthlyRent", "squareFeet", bedrooms, bathrooms, description,
        amenities, "propertyType", "ownerId", "createdAt", "updatedAt"
      )
      VALUES (
        ${data.propertyName}, ${data.address}, ${data.neighborhood},
        ST_SetSRID(ST_MakePoint(${data.longitude}, ${data.latitude}), 4326)::geography,
        ${data.longitude}, ${data.latitude}, ${data.monthlyRent}, ${data.squareFeet},
        ${data.bedrooms || 0}, ${data.bathrooms || 0}, ${data.description},
        ${data.amenities}::text[], ${data.propertyType}, ${ownerId},
        NOW(), NOW()
      )
      RETURNING id, "propertyName", address, neighborhood, longitude, latitude,
                "monthlyRent", "squareFeet", bedrooms, bathrooms, description,
                amenities, "propertyType", status, "ownerId", "createdAt"
    `;

        // Invalidate cache
        await RedisService.invalidatePattern('cache:/api/properties*');
        await RedisService.invalidatePattern('cache:/api/search*');

        return property[0];
    }

    /**
     * Get property by ID
     */
    static async getPropertyById(propertyId: number, userId?: number) {
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        profileImage: true,
                        verificationStatus: true,
                        verified: true
                    }
                },
                images: {
                    orderBy: { isPrimary: 'desc' }
                },
                reviews: {
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
                    take: 10
                },
                _count: {
                    select: {
                        favorites: true,
                        reviews: true,
                        inquiries: true
                    }
                }
            }
        });

        if (!property) {
            throw new ApiError(404, 'Property not found');
        }

        // Increment view count
        await prisma.property.update({
            where: { id: propertyId },
            data: { views: { increment: 1 } }
        });

        // Check if user has favorited this property
        let isFavorited = false;
        if (userId) {
            const favorite = await prisma.favorite.findUnique({
                where: {
                    userId_propertyId: {
                        userId,
                        propertyId
                    }
                }
            });
            isFavorited = !!favorite;
        }

        // Calculate average rating
        const avgRating = property.reviews.length > 0
            ? property.reviews.reduce((sum, r) => sum + r.rating, 0) / property.reviews.length
            : 0;

        return {
            ...property,
            isFavorited,
            averageRating: Math.round(avgRating * 10) / 10,
            reviewCount: property._count.reviews,
            favoriteCount: property._count.favorites
        };
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
    static async updateProperty(propertyId: number, ownerId: number, data: UpdatePropertyDTO) {
        // Verify ownership
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            throw new ApiError(404, 'Property not found');
        }

        if (property.ownerId !== ownerId) {
            throw new ApiError(403, 'Not authorized to update this property');
        }

        // Update property
        const updated = await prisma.property.update({
            where: { id: propertyId },
            data
        });

        // Invalidate cache
        await RedisService.del(CACHE_KEYS.PROPERTY_DETAIL(propertyId));
        await RedisService.invalidatePattern('cache:/api/properties*');
        await RedisService.invalidatePattern('cache:/api/search*');

        return updated;
    }

    /**
     * Delete property
     */
    static async deleteProperty(propertyId: number, ownerId: number) {
        // Verify ownership
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            throw new ApiError(404, 'Property not found');
        }

        if (property.ownerId !== ownerId) {
            throw new ApiError(403, 'Not authorized to delete this property');
        }

        // Delete property (cascades to images, reviews, etc.)
        await prisma.property.delete({
            where: { id: propertyId }
        });

        // Invalidate cache
        await RedisService.del(CACHE_KEYS.PROPERTY_DETAIL(propertyId));
        await RedisService.invalidatePattern('cache:/api/properties*');
        await RedisService.invalidatePattern('cache:/api/search*');

        return { message: 'Property deleted successfully' };
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