import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get user's notifications
 * GET /api/notifications
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unread === 'true';
    const skip = (page - 1) * limit;

    const where = {
        userId: req.user!.id,
        ...(unreadOnly && { read: false })
    };

    const [notifications, total, _unreadCount] = await Promise.all([
        prisma.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit
        }),
        prisma.notification.count({ where }),
        prisma.notification.count({
            where: {
                userId: req.user!.id,
                read: false
            }
        })
    ]);

    res.json(
        ApiResponse.paginated(
            notifications,
            {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            'Notifications retrieved successfully'
        )
    );
});

/**
 * Mark notification as read
 * PUT /api/notifications/:id/read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const notificationId = parseInt(req.params.id);

    const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
    });

    if (!notification) {
        throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== req.user!.id) {
        throw new ApiError(403, 'Not authorized');
    }

    const updated = await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true }
    });

    res.json(
        ApiResponse.success(updated, 'Notification marked as read')
    );
});

/**
 * Mark all notifications as read
 * PUT /api/notifications/read-all
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    await prisma.notification.updateMany({
        where: {
            userId: req.user!.id,
            read: false
        },
        data: { read: true }
    });

    res.json(
        ApiResponse.success(null, 'All notifications marked as read')
    );
});

/**
 * Delete notification
 * DELETE /api/notifications/:id
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const notificationId = parseInt(req.params.id);

    const notification = await prisma.notification.findUnique({
        where: { id: notificationId }
    });

    if (!notification) {
        throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== req.user!.id) {
        throw new ApiError(403, 'Not authorized');
    }

    await prisma.notification.delete({
        where: { id: notificationId }
    });

    res.json(
        ApiResponse.success(null, 'Notification deleted successfully')
    );
});

/**
 * Get unread count
 * GET /api/notifications/unread/count
 */
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const count = await prisma.notification.count({
        where: {
            userId: req.user!.id,
            read: false
        }
    });

    res.json(
        ApiResponse.success({ count }, 'Unread count retrieved')
    );
});