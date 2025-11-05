import { Request, Response, NextFunction } from 'express';

/**
 * Wraps async route handlers to catch errors
 * Automatically passes errors to Express error handler
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};