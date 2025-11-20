import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { ApiResponse } from '../utils/apiResponse';
import { prisma } from '../utils/prisma';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        // Get token from cookie or Authorization header
        const token = req.cookies.token ||
            req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json(
                ApiResponse.error('Authentication required')
            );
        }

        // Verify token
        const decoded: TokenPayload = verifyToken(token);

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                verified: true,
                verificationStatus: true
            }
        });

        if (!user) {
            return res.status(401).json(
                ApiResponse.error('User not found')
            );
        }

        // Attach user to request
        req.user = user;
        return next();  // ADD RETURN HERE
    } catch (error) {
        return res.status(401).json(
            ApiResponse.error('Invalid or expired token')
        );
    }
};

/**
 * Authorization middleware
 * Checks if user has required role
 */
export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json(
                ApiResponse.error('Authentication required')
            );
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json(
                ApiResponse.error('Insufficient permissions')
            );
        }

        return next();  // RETURN HERE TOO
    };
};

/**
 * Optionally authenticate
 * Attaches user if token is valid, but doesn't require it
 */
export const optionalAuth = async (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        const token = req.cookies.token ||
            req.headers.authorization?.replace('Bearer ', '');

        if (token) {
            const decoded: TokenPayload = verifyToken(token);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    verified: true
                }
            });

            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Silently fail - user remains undefined
    }

    return next();  // ADD RETURN HERE TOO
};