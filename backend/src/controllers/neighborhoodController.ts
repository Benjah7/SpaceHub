import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { PrismaClient } from '@prisma/client';


const prisma = new PrismaClient();

/**
 * Get all neighborhoods
 * GET /api/neighborhoods
 */
export const getNeighborhoods = asyncHandler(async (_req: Request, res: Response) => {
    const neighborhoods = await prisma.neighborhood.findMany({
        orderBy: { name: 'asc' }
    });

    res.json(
        ApiResponse.success(neighborhoods, 'Neighborhoods retrieved successfully')
    );
});

/**
 * Get neighborhood by ID
 * GET /api/neighborhoods/:id
 */
export const getNeighborhoodById = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const neighborhood = await prisma.neighborhood.findUnique({
        where: { id }
    });

    if (!neighborhood) {
        return res.status(404).json(
            ApiResponse.error('Neighborhood not found')
        );
    }

    // Get property count in this neighborhood
    const propertyCount = await prisma.property.count({
        where: { neighborhood: neighborhood.name }
    });

    return res.json(
        ApiResponse.success(
            { ...neighborhood, propertyCount },
            'Neighborhood retrieved successfully'
        )
    );
});

/**
 * Get neighborhood stats
 * GET /api/neighborhoods/:name/stats
 */
export const getNeighborhoodStats = asyncHandler(async (req: Request, res: Response) => {
    const { name } = req.params;

    const [properties, avgRent, minRent, maxRent] = await Promise.all([
        prisma.property.count({
            where: { neighborhood: name, status: 'AVAILABLE' }
        }),
        prisma.property.aggregate({
            where: { neighborhood: name },
            _avg: { monthlyRent: true }
        }),
        prisma.property.aggregate({
            where: { neighborhood: name },
            _min: { monthlyRent: true }
        }),
        prisma.property.aggregate({
            where: { neighborhood: name },
            _max: { monthlyRent: true }
        })
    ]);

    res.json(
        ApiResponse.success({
            neighborhood: name,
            availableProperties: properties,
            averageRent: avgRent._avg.monthlyRent,
            minRent: minRent._min.monthlyRent,
            maxRent: maxRent._max.monthlyRent
        }, 'Neighborhood stats retrieved successfully')
    );
});