import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { SpatialService } from '../services/spatialService';
import { SearchCriteria } from '../types';

/**
 * Search properties by radius
 * GET /api/search/radius
 */
export const searchByRadius = asyncHandler(async (req: Request, res: Response) => {
    const latitude = parseFloat(req.query.latitude as string);
    const longitude = parseFloat(req.query.longitude as string);
    const radius = parseFloat(req.query.radius as string) || 5;

    const filters: SearchCriteria = {
        propertyType: req.query.propertyType as any,
        minRent: req.query.minRent ? parseFloat(req.query.minRent as string) : undefined,
        maxRent: req.query.maxRent ? parseFloat(req.query.maxRent as string) : undefined,
        neighborhood: req.query.neighborhood as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    const result = await SpatialService.searchByRadius(latitude, longitude, radius, filters);

    res.json(
        ApiResponse.paginated(result.properties, result.pagination, 'Properties found')
    );
});

/**
 * Search properties by bounding box
 * GET /api/search/bounds
 */
export const searchByBounds = asyncHandler(async (req: Request, res: Response) => {
    const minLat = parseFloat(req.query.minLat as string);
    const minLng = parseFloat(req.query.minLng as string);
    const maxLat = parseFloat(req.query.maxLat as string);
    const maxLng = parseFloat(req.query.maxLng as string);

    const filters: SearchCriteria = {
        propertyType: req.query.propertyType as any,
        minRent: req.query.minRent ? parseFloat(req.query.minRent as string) : undefined,
        maxRent: req.query.maxRent ? parseFloat(req.query.maxRent as string) : undefined,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20
    };

    const properties = await SpatialService.searchByBounds(minLat, minLng, maxLat, maxLng, filters);

    res.json(
        ApiResponse.success(properties, 'Properties found')
    );
});

/**
 * Get nearby properties
 * GET /api/search/nearby/:propertyId
 */
export const getNearbyProperties = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.propertyId);
    const radius = parseFloat(req.query.radius as string) || 5;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await SpatialService.getNearbyProperties(propertyId, radius, limit);

    // ✅ FIX: Return the entire result object which has properties and pagination
    res.json(
        ApiResponse.paginated(result.properties, result.pagination, 'Nearby properties found')
    );
});

/**
 * Calculate distance between two points
 * GET /api/search/distance
 */
export const calculateDistance = asyncHandler(async (req: Request, res: Response) => {
    const lat1 = parseFloat(req.query.lat1 as string);
    const lng1 = parseFloat(req.query.lng1 as string);
    const lat2 = parseFloat(req.query.lat2 as string);
    const lng2 = parseFloat(req.query.lng2 as string);

    const distance = await SpatialService.calculateDistance(lat1, lng1, lat2, lng2);

    res.json(
        ApiResponse.success({ distance, unit: 'meters' }, 'Distance calculated')
    );
});