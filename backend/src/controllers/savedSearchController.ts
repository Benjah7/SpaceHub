import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { prisma } from '../utils/prisma';

/**
 * Create saved search
 * POST /api/saved-searches
 */
export const createSavedSearch = asyncHandler(async (req: Request, res: Response) => {
    const { name, criteria, notifyEmail, notifySMS } = req.body;

    const savedSearch = await prisma.savedSearch.create({
        data: {
            name,
            criteria,
            notifyEmail: notifyEmail ?? true,
            notifySMS: notifySMS ?? false,
            userId: req.user!.id
        }
    });

    res.status(201).json(
        ApiResponse.success(savedSearch, 'Saved search created successfully')
    );
});

/**
 * Get user's saved searches
 * GET /api/saved-searches
 */
export const getSavedSearches = asyncHandler(async (req: Request, res: Response) => {
    const savedSearches = await prisma.savedSearch.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' }
    });

    res.json(
        ApiResponse.success(savedSearches, 'Saved searches retrieved successfully')
    );
});

/**
 * Update saved search
 * PUT /api/saved-searches/:id
 */
export const updateSavedSearch = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { name, criteria, notifyEmail, notifySMS } = req.body;

    const savedSearch = await prisma.savedSearch.findUnique({
        where: { id }
    });

    if (!savedSearch) {
        throw new ApiError(404, 'Saved search not found');
    }

    if (savedSearch.userId !== req.user!.id) {
        throw new ApiError(403, 'Not authorized');
    }

    const updated = await prisma.savedSearch.update({
        where: { id },
        data: {
            name,
            criteria,
            notifyEmail,
            notifySMS
        }
    });

    res.json(
        ApiResponse.success(updated, 'Saved search updated successfully')
    );
});

/**
 * Delete saved search
 * DELETE /api/saved-searches/:id
 */
export const deleteSavedSearch = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const savedSearch = await prisma.savedSearch.findUnique({
        where: { id }
    });

    if (!savedSearch) {
        throw new ApiError(404, 'Saved search not found');
    }

    if (savedSearch.userId !== req.user!.id) {
        throw new ApiError(403, 'Not authorized');
    }

    await prisma.savedSearch.delete({
        where: { id }
    });

    res.json(
        ApiResponse.success(null, 'Saved search deleted successfully')
    );
});