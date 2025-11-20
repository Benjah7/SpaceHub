import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { PropertyService } from '../services/propertyService';
import { CloudinaryService } from '../services/cloudinaryService';

/**
 * Create new property
 * POST /api/properties
 */
export const createProperty = asyncHandler(async (req: Request, res: Response) => {
    const property = await PropertyService.createProperty(req.body, req.user!.id);

    res.status(201).json(
        ApiResponse.success(property, 'Property created successfully')
    );
});

/**
 * Get all properties
 * GET /api/properties
 */
export const getProperties = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const filters = {
        status: req.query.status,
        propertyType: req.query.propertyType,
        neighborhood: req.query.neighborhood,
        ownerId: req.query.ownerId ? parseInt(req.query.ownerId as string) : undefined,
        featured: req.query.featured === 'true',
        minRent: req.query.minRent ? parseFloat(req.query.minRent as string) : undefined,
        maxRent: req.query.maxRent ? parseFloat(req.query.maxRent as string) : undefined,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as 'asc' | 'desc'
    };

    const result = await PropertyService.getProperties(page, limit, filters);

    res.json(
        ApiResponse.paginated(result.properties, result.pagination, 'Properties retrieved successfully')
    );
});

/**
 * Get property by ID
 * GET /api/properties/:id
 */
export const getPropertyById = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.id);
    const userId = req.user?.id;

    const property = await PropertyService.getPropertyById(propertyId, userId);

    res.json(
        ApiResponse.success(property, 'Property retrieved successfully')
    );
});

/**
 * Update property
 * PUT /api/properties/:id
 */
export const updateProperty = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.id);

    const property = await PropertyService.updateProperty(propertyId, req.body,  req.user!.id);

    res.json(
        ApiResponse.success(property, 'Property updated successfully')
    );
});

/**
 * Delete property
 * DELETE /api/properties/:id
 */
export const deleteProperty = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.id);

    await PropertyService.deleteProperty(propertyId, req.user!.id);

    res.json(
        ApiResponse.success(null, 'Property deleted successfully')
    );
});

/**
 * Get owner's properties
 * GET /api/properties/owner/me
 */
export const getMyProperties = asyncHandler(async (req: Request, res: Response) => {
    const properties = await PropertyService.getOwnerProperties(req.user!.id);

    res.json(
        ApiResponse.success(properties, 'Your properties retrieved successfully')
    );
});

/**
 * Upload property images
 * POST /api/properties/:id/images
 */
export const uploadImages = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.id);

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new ApiError(400, 'No images provided');
    }

    const images = await CloudinaryService.uploadPropertyImages(
        req.files,
        propertyId,
        req.user!.id
    );

    res.status(201).json(
        ApiResponse.success(images, 'Images uploaded successfully')
    );
});

/**
 * Delete property image
 * DELETE /api/properties/images/:imageId
 */
export const deleteImage = asyncHandler(async (req: Request, res: Response) => {
    const imageId = parseInt(req.params.imageId);

    await CloudinaryService.deletePropertyImage(imageId, req.user!.id);

    res.json(
        ApiResponse.success(null, 'Image deleted successfully')
    );
});

/**
 * Set primary image
 * PUT /api/properties/images/:imageId/primary
 */
export const setPrimaryImage = asyncHandler(async (req: Request, res: Response) => {
    const imageId = parseInt(req.params.imageId);

    await CloudinaryService.setPrimaryImage(imageId, req.user!.id);

    res.json(
        ApiResponse.success(null, 'Primary image updated successfully')
    );
});