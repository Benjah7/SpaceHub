import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { CloudinaryService } from '../services/cloudinaryService';
import { prisma } from '../utils/prisma';

/**
 * Upload document
 * POST /api/documents
 */
export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        throw new ApiError(400, 'No document file provided');
    }

    const { type, propertyId } = req.body;

    const document = await CloudinaryService.uploadDocument(
        req.file,
        req.user!.id,
        type,
        propertyId ? parseInt(propertyId) : undefined
    );

    res.status(201).json(
        ApiResponse.success(document, 'Document uploaded successfully')
    );
});

/**
 * Get user's documents
 * GET /api/documents
 */
export const getDocuments = asyncHandler(async (req: Request, res: Response) => {
    const documents = await prisma.document.findMany({
        where: { userId: req.user!.id },
        include: {
            property: {
                select: {
                    id: true,
                    propertyName: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json(
        ApiResponse.success(documents, 'Documents retrieved successfully')
    );
});

/**
 * Get property documents
 * GET /api/documents/property/:propertyId
 */
export const getPropertyDocuments = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.propertyId);

    // Verify user has access to property
    const property = await prisma.property.findUnique({
        where: { id: propertyId }
    });

    if (!property) {
        throw new ApiError(404, 'Property not found');
    }

    if (property.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        throw new ApiError(403, 'Not authorized to view property documents');
    }

    const documents = await prisma.document.findMany({
        where: { propertyId },
        orderBy: { createdAt: 'desc' }
    });

    res.json(
        ApiResponse.success(documents, 'Property documents retrieved successfully')
    );
});

/**
 * Delete document
 * DELETE /api/documents/:id
 */
export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const document = await prisma.document.findUnique({
        where: { id }
    });

    if (!document) {
        throw new ApiError(404, 'Document not found');
    }

    if (document.userId !== req.user!.id && req.user!.role !== 'ADMIN') {
        throw new ApiError(403, 'Not authorized to delete this document');
    }

    await prisma.document.delete({
        where: { id }
    });

    res.json(
        ApiResponse.success(null, 'Document deleted successfully')
    );
});