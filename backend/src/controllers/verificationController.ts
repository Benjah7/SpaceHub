import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { EmailService } from '../services/emailService';
import { SMSService } from '../services/smsService';
import { prisma } from '../utils/prisma';

/**
 * Get pending verification requests
 * GET /api/verification/pending
 * Admin only
 */
export const getPendingVerifications = asyncHandler(async (_req: Request, res: Response) => {
    const pendingUsers = await prisma.user.findMany({
        where: {
            verificationStatus: 'PENDING',
            role: 'OWNER'
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
            documents: {
                where: {
                    type: {
                        in: ['TITLE_DEED', 'BUSINESS_PERMIT', 'ID_DOCUMENT', 'TAX_COMPLIANCE']
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            properties: {
                select: {
                    id: true,
                    propertyName: true,
                    status: true
                }
            }
        },
        orderBy: { createdAt: 'asc' }
    });

    res.json(
        ApiResponse.success(pendingUsers, 'Pending verifications retrieved successfully')
    );
});

/**
 * Get all verification requests (with filters)
 * GET /api/verification/all
 * Admin only
 */
export const getAllVerifications = asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;

    const where: any = { role: 'OWNER' };

    if (status && ['UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED'].includes(status as string)) {
        where.verificationStatus = status;
    }

    const users = await prisma.user.findMany({
        where,
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            verificationStatus: true,
            createdAt: true,
            updatedAt: true,
            documents: {
                where: {
                    type: {
                        in: ['TITLE_DEED', 'BUSINESS_PERMIT', 'ID_DOCUMENT', 'TAX_COMPLIANCE']
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            properties: {
                select: {
                    id: true,
                    propertyName: true,
                    status: true
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    res.json(
        ApiResponse.success(users, 'Verifications retrieved successfully')
    );
});

/**
 * Get verification details for specific user
 * GET /api/verification/:userId
 * Admin only
 */
export const getVerificationDetails = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            verificationStatus: true,
            bio: true,
            profileImage: true,
            createdAt: true,
            updatedAt: true,
            documents: {
                orderBy: { createdAt: 'desc' }
            },
            properties: {
                include: {
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    }
                }
            }
        }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (user.role !== 'OWNER') {
        throw new ApiError(400, 'User is not a property owner');
    }

    res.json(
        ApiResponse.success(user, 'Verification details retrieved successfully')
    );
});

/**
 * Approve verification
 * POST /api/verification/:userId/approve
 * Admin only
 */
export const approveVerification = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const { notes } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, verificationStatus: true }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (user.verificationStatus === 'VERIFIED') {
        throw new ApiError(400, 'User is already verified');
    }

    // Update verification status
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            verificationStatus: 'VERIFIED',
            verified: true
        },
        select: {
            id: true,
            name: true,
            email: true,
            verificationStatus: true
        }
    });

    // Send notification
    await prisma.notification.create({
        data: {
            type: 'SUCCESS',
            title: 'Verification Approved',
            message: notes || 'Your account has been verified. You can now list properties with the verified badge.',
            userId: userId
        }
    });

    // Send email
    await EmailService.sendVerificationApproval(user.email, user.name);

    // Send SMS
    await SMSService.sendVerificationApproval(user.phone, user.name);

    res.json(
        ApiResponse.success(updatedUser, 'Verification approved successfully')
    );
});

/**
 * Reject verification
 * POST /api/verification/:userId/reject
 * Admin only
 */
export const rejectVerification = asyncHandler(async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
    const { reason } = req.body;

    if (!reason) {
        throw new ApiError(400, 'Rejection reason is required');
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, phone: true, verificationStatus: true }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    // Update verification status
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            verificationStatus: 'REJECTED',
            verified: false
        },
        select: {
            id: true,
            name: true,
            email: true,
            verificationStatus: true
        }
    });

    // Send notification
    await prisma.notification.create({
        data: {
            type: 'ERROR',
            title: 'Verification Rejected',
            message: `Your verification was rejected. Reason: ${reason}. Please update your documents and resubmit.`,
            userId: userId
        }
    });

    // Send email
    await EmailService.sendVerificationRejection(user.email, user.name, reason);

    // Send SMS
    await SMSService.sendVerificationRejection(user.phone, user.name);

    res.json(
        ApiResponse.success(updatedUser, 'Verification rejected successfully')
    );
});

/**
 * Request verification (for property owners)
 * POST /api/verification/request
 * Owner only
 */
export const requestVerification = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            verificationStatus: true,
            documents: {
                where: {
                    type: {
                        in: ['TITLE_DEED', 'BUSINESS_PERMIT', 'ID_DOCUMENT']
                    }
                }
            }
        }
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (user.verificationStatus === 'PENDING') {
        throw new ApiError(400, 'Verification request already pending');
    }

    if (user.verificationStatus === 'VERIFIED') {
        throw new ApiError(400, 'Account is already verified');
    }

    // Check if required documents are uploaded
    if (user.documents.length === 0) {
        throw new ApiError(400, 'Please upload verification documents before requesting verification');
    }

    // Update status to pending
    await prisma.user.update({
        where: { id: userId },
        data: { verificationStatus: 'PENDING' }
    });

    // Notify admins
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' },
        select: { id: true }
    });

    await Promise.all(
        admins.map(admin =>
            prisma.notification.create({
                data: {
                    type: 'INFO',
                    title: 'New Verification Request',
                    message: `User ${req.user!.name} has requested account verification`,
                    userId: admin.id
                }
            })
        )
    );

    res.json(
        ApiResponse.success(null, 'Verification request submitted successfully')
    );
});

/**
 * Get verification statistics
 * GET /api/verification/stats
 * Admin only
 */
export const getVerificationStats = asyncHandler(async (_req: Request, res: Response) => {
    const [unverified, pending, verified, rejected] = await Promise.all([
        prisma.user.count({ where: { role: 'OWNER', verificationStatus: 'UNVERIFIED' } }),
        prisma.user.count({ where: { role: 'OWNER', verificationStatus: 'PENDING' } }),
        prisma.user.count({ where: { role: 'OWNER', verificationStatus: 'VERIFIED' } }),
        prisma.user.count({ where: { role: 'OWNER', verificationStatus: 'REJECTED' } })
    ]);

    res.json(
        ApiResponse.success({
            unverified,
            pending,
            verified,
            rejected,
            total: unverified + pending + verified + rejected
        }, 'Verification statistics retrieved successfully')
    );
});