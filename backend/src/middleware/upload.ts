import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import { ApiError } from '../utils/apiResponse';
import { VALIDATION } from '../utils/constants';

/**
 * Multer memory storage configuration
 */
const storage = multer.memoryStorage();

/**
 * File filter for image uploads
 */
const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    // Accept images only
    if (!file.mimetype.startsWith('image/')) {
        return cb(new ApiError(400, 'Only image files are allowed') as any);
    }

    // Accept common image formats
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new ApiError(400, 'Only JPEG, PNG, and WebP images are allowed') as any);
    }

    cb(null, true);
};

/**
 * File filter for documents
 */
const documentFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    const allowedMimeTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new ApiError(400, 'Only PDF and Word documents are allowed') as any);
    }

    cb(null, true);
};

/**
 * Upload middleware for property images
 */
export const uploadPropertyImages: any = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: VALIDATION.MAX_FILE_SIZE,
        files: VALIDATION.MAX_IMAGES
    }
}).array('images', VALIDATION.MAX_IMAGES);

/**
 * Upload middleware for profile image
 */
export const uploadProfileImage: any = multer({
    storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: VALIDATION.MAX_FILE_SIZE,
        files: 1
    }
}).single('image');

/**
 * Upload middleware for documents
 */
export const uploadDocument: any = multer({
    storage,
    fileFilter: documentFilter,
    limits: {
        fileSize: VALIDATION.MAX_FILE_SIZE,
        files: 1
    }
}).single('document');