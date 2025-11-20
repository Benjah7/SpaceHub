import { Request, Response } from 'express';

import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { prisma } from '../utils/prisma';


/**
 * Create appointment
 * POST /api/appointments
 */
export const createAppointment = asyncHandler(async (req: Request, res: Response) => {
    const { propertyId, scheduledDate, notes } = req.body;
    const tenantId = req.user!.id;

    // Get property owner
    const property = await prisma.property.findUnique({
        where: { id: parseInt(propertyId) },
        select: { ownerId: true, status: true }
    });

    if (!property) {
        throw new ApiError(404, 'Property not found');
    }

    if (property.status !== 'AVAILABLE') {
        throw new ApiError(400, 'Property not available for viewing');
    }

    // Check for duplicate appointment
    const existing = await prisma.appointment.findFirst({
        where: {
            propertyId: parseInt(propertyId),
            tenantId,
            status: { in: ['PENDING', 'CONFIRMED'] },
            scheduledDate: new Date(scheduledDate)
        }
    });

    if (existing) {
        throw new ApiError(400, 'Appointment already exists for this time');
    }

    const appointment = await prisma.appointment.create({
        data: {
            propertyId: parseInt(propertyId),
            tenantId,
            ownerId: property.ownerId,
            scheduledDate: new Date(scheduledDate),
            notes,
            status: 'PENDING'
        },
        include: {
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true,
                    images: { where: { isPrimary: true }, take: 1 }
                }
            },
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true
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
        }
    });

    // Create notification for owner
    await prisma.notification.create({
        data: {
            userId: property.ownerId,
            type: 'APPOINTMENT_REQUEST',
            title: 'New Viewing Request',
            message: `${req.user!.name} requested a viewing for ${appointment.property.propertyName}`,
            link: `/dashboard/appointments/${appointment.id}`
        }
    });

    res.status(201).json(
        ApiResponse.success(appointment, 'Appointment created')
    );
});

/**
 * Get user appointments
 * GET /api/appointments
 */
export const getAppointments = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { status, role } = req.query;

    const whereClause: any = {
        OR: [
            { tenantId: userId },
            { ownerId: userId }
        ]
    };

    if (status) {
        whereClause.status = status;
    }

    if (role === 'tenant') {
        whereClause.OR = [{ tenantId: userId }];
    } else if (role === 'owner') {
        whereClause.OR = [{ ownerId: userId }];
    }

    const appointments = await prisma.appointment.findMany({
        where: whereClause,
        include: {
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true,
                    neighborhood: true,
                    images: { where: { isPrimary: true }, take: 1 }
                }
            },
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profileImage: true
                }
            },
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profileImage: true
                }
            }
        },
        orderBy: { scheduledDate: 'asc' }
    });

    res.json(
        ApiResponse.success(appointments, 'Appointments retrieved')
    );
});

/**
 * Get appointment by ID
 * GET /api/appointments/:id
 */
export const getAppointmentById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) },
        include: {
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true,
                    neighborhood: true,
                    monthlyRent: true,
                    squareFeet: true,
                    images: { where: { isPrimary: true }, take: 1 }
                }
            },
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profileImage: true
                }
            },
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    profileImage: true
                }
            }
        }
    });

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (appointment.tenantId !== userId && appointment.ownerId !== userId) {
        throw new ApiError(403, 'Not authorized to view this appointment');
    }

    res.json(
        ApiResponse.success(appointment, 'Appointment retrieved')
    );
});

/**
 * Update appointment status
 * PUT /api/appointments/:id/status
 */
export const updateAppointmentStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;
    const userId = req.user!.id;

    const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) },
        include: {
            property: true,
            tenant: true,
            owner: true
        }
    });

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    // Authorization checks
    if (status === 'CONFIRMED' && appointment.ownerId !== userId) {
        throw new ApiError(403, 'Only the owner can confirm appointments');
    }

    if (status === 'CANCELLED' && appointment.tenantId !== userId && appointment.ownerId !== userId) {
        throw new ApiError(403, 'Not authorized to cancel this appointment');
    }

    if (status === 'COMPLETED' && appointment.ownerId !== userId) {
        throw new ApiError(403, 'Only the owner can mark appointments as completed');
    }

    const updated = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: {
            status,
            cancellationReason: status === 'CANCELLED' ? cancellationReason : null
        },
        include: {
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true
                }
            },
            tenant: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            owner: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    // Create notification
    const notificationUserId = userId === appointment.tenantId ? appointment.ownerId : appointment.tenantId;
    const notificationMessages: Record<string, string> = {
        CONFIRMED: `Your viewing request for ${appointment.property.propertyName} has been confirmed`,
        CANCELLED: `The viewing for ${appointment.property.propertyName} has been cancelled`,
        COMPLETED: `The viewing for ${appointment.property.propertyName} has been completed`
    };

    if (notificationMessages[status]) {
        await prisma.notification.create({
            data: {
                userId: notificationUserId,
                type: `APPOINTMENT_${status}`,
                title: 'Appointment Update',
                message: notificationMessages[status],
                link: `/appointments/${appointment.id}`
            }
        });
    }

    res.json(
        ApiResponse.success(updated, 'Appointment updated')
    );
});

/**
 * Reschedule appointment
 * PUT /api/appointments/:id/reschedule
 */
export const rescheduleAppointment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { scheduledDate, notes } = req.body;
    const userId = req.user!.id;

    const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) },
        include: { property: true }
    });

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (appointment.tenantId !== userId && appointment.ownerId !== userId) {
        throw new ApiError(403, 'Not authorized to reschedule this appointment');
    }

    if (appointment.status === 'CANCELLED' || appointment.status === 'COMPLETED') {
        throw new ApiError(400, 'Cannot reschedule cancelled or completed appointments');
    }

    const updated = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: {
            scheduledDate: new Date(scheduledDate),
            notes,
            status: 'PENDING' // Reset to pending for owner confirmation
        },
        include: {
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true
                }
            },
            tenant: true,
            owner: true
        }
    });

    // Notify other party
    const notificationUserId = userId === appointment.tenantId ? appointment.ownerId : appointment.tenantId;
    await prisma.notification.create({
        data: {
            userId: notificationUserId,
            type: 'APPOINTMENT_RESCHEDULED',
            title: 'Appointment Rescheduled',
            message: `The viewing for ${appointment.property.propertyName} has been rescheduled`,
            link: `/appointments/${appointment.id}`
        }
    });

    res.json(
        ApiResponse.success(updated, 'Appointment rescheduled')
    );
});

/**
 * Delete appointment
 * DELETE /api/appointments/:id
 */
export const deleteAppointment = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) }
    });

    if (!appointment) {
        throw new ApiError(404, 'Appointment not found');
    }

    if (appointment.tenantId !== userId && appointment.ownerId !== userId) {
        throw new ApiError(403, 'Not authorized to delete this appointment');
    }

    await prisma.appointment.delete({
        where: { id: parseInt(id) }
    });

    res.json(
        ApiResponse.success(null, 'Appointment deleted')
    );
});

/**
 * Get upcoming appointments count
 * GET /api/appointments/upcoming/count
 */
export const getUpcomingCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const count = await prisma.appointment.count({
        where: {
            OR: [
                { tenantId: userId },
                { ownerId: userId }
            ],
            status: { in: ['PENDING', 'CONFIRMED'] },
            scheduledDate: {
                gte: new Date()
            }
        }
    });

    res.json(
        ApiResponse.success({ count }, 'Upcoming appointments count retrieved')
    );
});