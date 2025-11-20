import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse, ApiError } from '../utils/apiResponse';
import { prisma } from '../utils/prisma';


/**
 * Create or get existing conversation
 * POST /api/messages/conversations
 */
export const createConversation = asyncHandler(async (req: Request, res: Response) => {
    const { participantId, propertyId } = req.body;
    const userId = req.user!.id;

    // Check if conversation already exists
    const existingConversation = await prisma.conversation.findFirst({
        where: {
            propertyId: propertyId ? parseInt(propertyId) : null,
            participants: {
                every: {
                    userId: {
                        in: [userId, parseInt(participantId)]
                    }
                }
            }
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileImage: true,
                            role: true
                        }
                    }
                }
            },
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    }
                }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        }
    });

    if (existingConversation) {
        return res.json(
            ApiResponse.success(existingConversation, 'Conversation retrieved')
        );
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
        data: {
            propertyId: propertyId ? parseInt(propertyId) : null,
            participants: {
                create: [
                    { userId },
                    { userId: parseInt(participantId) }
                ]
            }
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileImage: true,
                            role: true
                        }
                    }
                }
            },
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    }
                }
            }
        }
    });

    return res.status(201).json(
        ApiResponse.success(conversation, 'Conversation created')
    );
});

/**
 * Get user's conversations
 * GET /api/messages/conversations
 */
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: {
                    userId
                }
            }
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            profileImage: true,
                            role: true
                        }
                    }
                }
            },
            property: {
                select: {
                    id: true,
                    propertyName: true,
                    address: true,
                    images: {
                        where: { isPrimary: true },
                        take: 1
                    }
                }
            },
            messages: {
                orderBy: { createdAt: 'desc' },
                take: 1
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    // Count unread messages for each conversation
    const conversationsWithUnread = await Promise.all(
        conversations.map(async (conv) => {
            const unreadCount = await prisma.message.count({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    read: false
                }
            });

            return {
                ...conv,
                unreadCount
            };
        })
    );

    res.json(
        ApiResponse.success(conversationsWithUnread, 'Conversations retrieved')
    );
});

/**
 * Get conversation messages
 * GET /api/messages/conversations/:id/messages
 */
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user!.id;

    const conversationId = parseInt(id);

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findFirst({
        where: {
            conversationId,
            userId
        }
    });

    if (!participant) {
        throw new ApiError(403, 'Not authorized to view this conversation');
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [messages, total] = await Promise.all([
        prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        profileImage: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: Number(limit)
        }),
        prisma.message.count({
            where: { conversationId }
        })
    ]);

    // Mark messages as read
    await prisma.message.updateMany({
        where: {
            conversationId,
            senderId: { not: userId },
            read: false
        },
        data: { read: true }
    });

    // Update lastReadAt
    await prisma.conversationParticipant.update({
        where: {
            id: participant.id
        },
        data: {
            lastReadAt: new Date()
        }
    });

    res.json(
        ApiResponse.success({
            data: messages.reverse(),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit))
            }
        }, 'Messages retrieved')
    );
});

/**
 * Send message
 * POST /api/messages/conversations/:id/messages
 */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user!.id;

    const conversationId = parseInt(id);

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findFirst({
        where: {
            conversationId,
            userId
        }
    });

    if (!participant) {
        throw new ApiError(403, 'Not authorized to send messages in this conversation');
    }

    const message = await prisma.message.create({
        data: {
            conversationId,
            senderId: userId,
            content
        },
        include: {
            sender: {
                select: {
                    id: true,
                    name: true,
                    profileImage: true
                }
            }
        }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() }
    });

    // TODO: Send real-time notification to other participants
    // TODO: Send push notification

    res.status(201).json(
        ApiResponse.success(message, 'Message sent')
    );
});

/**
 * Mark messages as read
 * PUT /api/messages/conversations/:id/read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user!.id;

    const conversationId = parseInt(id);

    // Verify user is participant
    const participant = await prisma.conversationParticipant.findFirst({
        where: {
            conversationId,
            userId
        }
    });

    if (!participant) {
        throw new ApiError(403, 'Not authorized');
    }

    await prisma.message.updateMany({
        where: {
            conversationId,
            senderId: { not: userId },
            read: false
        },
        data: { read: true }
    });

    await prisma.conversationParticipant.update({
        where: { id: participant.id },
        data: { lastReadAt: new Date() }
    });

    res.json(
        ApiResponse.success(null, 'Messages marked as read')
    );
});

/**
 * Get unread message count
 * GET /api/messages/unread/count
 */
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const count = await prisma.message.count({
        where: {
            conversation: {
                participants: {
                    some: { userId }
                }
            },
            senderId: { not: userId },
            read: false
        }
    });

    res.json(
        ApiResponse.success({ count }, 'Unread count retrieved')
    );
});