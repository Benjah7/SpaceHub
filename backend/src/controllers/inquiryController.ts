import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { EmailService } from '../services/emailService';
import { SMSService } from '../services/smsService';
import { prisma } from '../utils/prisma';


/**
 * Create new inquiry
 * POST /api/inquiries
 */
export const createInquiry = asyncHandler(async (req: Request, res: Response) => {
    const { message, propertyId, preferredViewingDate } = req.body;

    // Get property and owner details
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            }
        }
    });

    if (!property) {
        throw new ApiError(404, 'Property not found');
    }

    // Create inquiry
    const inquiry = await prisma.inquiry.create({
        data: {
            message,
            preferredViewingDate: preferredViewingDate ? new Date(preferredViewingDate) : undefined,
            tenantId: req.user!.id,
            propertyId,
            ownerId: property.ownerId
        },
        include: {
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            },
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true
                }
            }
        }
    });

    // Send notifications to owner
    await EmailService.sendInquiryNotification(
        property.owner.email,
        property.propertyName,
        req.user!.name,
        message
    );

    // Send SMS to owner
    await SMSService.sendInquiryNotification(
        property.owner.phone,
        property.propertyName,
        req.user!.name
    );

    res.status(201).json(
        ApiResponse.success(inquiry, 'Inquiry sent successfully')
    );
});

/**
 * Get user's inquiries
 * GET /api/inquiries
 */
export const getMyInquiries = asyncHandler(async (req: Request, res: Response) => {
    const inquiries = await prisma.inquiry.findMany({
        where: { tenantId: req.user!.id },
        include: {
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true,
                    monthlyRent: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    }
                }
            },
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json(
        ApiResponse.success(inquiries, 'Inquiries retrieved successfully')
    );
});

/**
 * Get inquiries received by owner
 * GET /api/inquiries/received
 */
export const getReceivedInquiries = asyncHandler(async (req: Request, res: Response) => {
    const inquiries = await prisma.inquiry.findMany({
        where: { ownerId: req.user!.id },
        include: {
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            },
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json(
        ApiResponse.success(inquiries, 'Inquiries retrieved successfully')
    );
});

/**
 * Respond to inquiry
 * PUT /api/inquiries/:id/respond
 */
export const respondToInquiry = asyncHandler(async (req: Request, res: Response) => {
    const inquiryId = parseInt(req.params.id);
    const { response, status } = req.body;

    // Get inquiry
    const inquiry = await prisma.inquiry.findUnique({
        where: { id: inquiryId },
        include: {
            tenant: {
                select: {
                    email: true
                }
            },
            property: {
                select: {
                    propertyName: true
                }
            }
        }
    });

    if (!inquiry) {
        throw new ApiError(404, 'Inquiry not found');
    }

    if (inquiry.ownerId !== req.user!.id) {
        throw new ApiError(403, 'Not authorized to respond to this inquiry');
    }

    // Update inquiry
    const updated = await prisma.inquiry.update({
        where: { id: inquiryId },
        data: {
            response,
            status: status || 'RESPONDED',
            respondedAt: new Date()
        }
    });

    // Send notification to tenant
    await EmailService.sendInquiryResponse(
        inquiry.tenant.email,
        inquiry.property.propertyName,
        response
    );

    res.json(
        ApiResponse.success(updated, 'Response sent successfully')
    );
});

/**
 * Delete inquiry
 * DELETE /api/inquiries/:id
 */
export const deleteInquiry = asyncHandler(async (req: Request, res: Response) => {
    const inquiryId = parseInt(req.params.id);

    const inquiry = await prisma.inquiry.findUnique({
        where: { id: inquiryId }
    });

    if (!inquiry) {
        throw new ApiError(404, 'Inquiry not found');
    }

    if (inquiry.tenantId !== req.user!.id) {
        throw new ApiError(403, 'Not authorized to delete this inquiry');
    }

    await prisma.inquiry.delete({
        where: { id: inquiryId }
    });

    res.json(
        ApiResponse.success(null, 'Inquiry deleted successfully')
    );
});

/**
 * Get inquiries for a property
 * GET /api/properties/:propertyId/inquiries (called via property routes)
 */
export const getPropertyInquiries = asyncHandler(async (req: Request, res: Response) => {
    const propertyId = parseInt(req.params.propertyId);

    // Verify property exists
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { ownerId: true }
    });

    if (!property) {
        throw new ApiError(404, 'Property not found');
    }

    // Only owner can see property inquiries
    if (property.ownerId !== req.user!.id && req.user!.role !== 'ADMIN') {
        throw new ApiError(403, 'Not authorized');
    }

    const inquiries = await prisma.inquiry.findMany({
        where: { propertyId },
        include: {
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    res.json(
        ApiResponse.success(inquiries, 'Property inquiries retrieved successfully')
    );
});