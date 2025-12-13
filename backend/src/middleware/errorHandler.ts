import { Request, Response, NextFunction } from 'express';
import { ApiError, ApiResponse } from '../utils/apiResponse';
import { Prisma } from '../../generated/prisma/client';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: Error | ApiError,
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  // Handle custom API errors
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(
      ApiResponse.error(err.message, err.errors)
    );
  }

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(err, res);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(
      ApiResponse.error('Invalid token')
    );
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(
      ApiResponse.error('Token expired')
    );
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json(
      ApiResponse.error('Validation failed', err.message)
    );
  }

  // Handle Multer errors
  if (err.name === 'MulterError') {
    return handleMulterError(err as any, res);
  }

  // Default server error
  res.status(500).json(
    ApiResponse.error(
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message
    )
  );
  return next();
};

/**
 * Handle Multer-specific errors
 */
const handleMulterError = (err: any, res: Response) => {
  switch (err.code) {
    case 'LIMIT_FILE_SIZE':
      return res.status(400).json(
        ApiResponse.error('File is too large. Maximum file size is 10MB')
      );

    case 'LIMIT_FILE_COUNT':
      return res.status(400).json(
        ApiResponse.error('Too many files. Maximum is 10 files')
      );

    case 'LIMIT_UNEXPECTED_FILE':
      return res.status(400).json(
        ApiResponse.error('Unexpected file field')
      );

    default:
      return res.status(400).json(
        ApiResponse.error('File upload error')
      );
  }
};

/**
 * Handle Prisma-specific errors
 */
const handlePrismaError = (err: Prisma.PrismaClientKnownRequestError, res: Response) => {
  switch (err.code) {
    case 'P2002':
      // Unique constraint violation
      const field = (err.meta?.target as string[])?.[0] || 'field';
      return res.status(409).json(
        ApiResponse.error(`${field} already exists`)
      );

    case 'P2025':
      // Record not found
      return res.status(404).json(
        ApiResponse.error('Record not found')
      );

    case 'P2003':
      // Foreign key constraint violation
      return res.status(400).json(
        ApiResponse.error('Invalid reference')
      );

    default:
      return res.status(500).json(
        ApiResponse.error('Database error')
      );
  }
};