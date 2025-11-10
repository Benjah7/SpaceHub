import { body, param, query, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { VALIDATION } from '../utils/constants';

/**
 * Handles validation errors
 */
export const handleValidationErrors = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json(
            ApiResponse.error('Validation failed', errors.array())
        );
    }

    return next();
};

/**
 * Auth validation rules
 */
export const validateRegister = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .isLength({ min: VALIDATION.MIN_PASSWORD_LENGTH })
        .withMessage(`Password must be at least ${VALIDATION.MIN_PASSWORD_LENGTH} characters`),
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ min: 2, max: 200 })
        .withMessage('Name must be 2-200 characters'),
    body('phone')
        .matches(VALIDATION.PHONE_REGEX)
        .withMessage('Valid Kenyan phone number required (+254XXXXXXXXX)'),
    body('role')
        .isIn(['TENANT', 'OWNER'])
        .withMessage('Role must be TENANT or OWNER'),
    handleValidationErrors
];

export const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Valid email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    handleValidationErrors
];

/**
 * Property validation rules
 */
export const validateCreateProperty = [
    body('propertyName')
        .trim()
        .isLength({ min: VALIDATION.MIN_PROPERTY_NAME_LENGTH, max: VALIDATION.MAX_PROPERTY_NAME_LENGTH })
        .withMessage('Property name must be 3-200 characters'),
    body('address')
        .trim()
        .notEmpty()
        .withMessage('Address is required'),
    body('neighborhood')
        .trim()
        .notEmpty()
        .withMessage('Neighborhood is required'),
    body('longitude')
        .isFloat({ min: VALIDATION.NAIROBI_BOUNDS.minLng, max: VALIDATION.NAIROBI_BOUNDS.maxLng })
        .withMessage('Valid longitude for Nairobi required'),
    body('latitude')
        .isFloat({ min: VALIDATION.NAIROBI_BOUNDS.minLat, max: VALIDATION.NAIROBI_BOUNDS.maxLat })
        .withMessage('Valid latitude for Nairobi required'),
    body('monthlyRent')
        .isFloat({ min: 0 })
        .withMessage('Monthly rent must be positive'),
    body('squareFeet')
        .isInt({ min: 1 })
        .withMessage('Square feet must be positive'),
    body('description')
        .trim()
        .isLength({ min: VALIDATION.MIN_DESCRIPTION_LENGTH, max: VALIDATION.MAX_DESCRIPTION_LENGTH })
        .withMessage('Description must be 20-5000 characters'),
    body('amenities')
        .isArray()
        .withMessage('Amenities must be an array'),
    body('propertyType')
        .isIn(['RETAIL', 'OFFICE', 'KIOSK', 'STALL'])
        .withMessage('Invalid property type'),
    handleValidationErrors
];

export const validateUpdateProperty = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Valid property ID required'),
    body('monthlyRent')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Monthly rent must be positive'),
    body('squareFeet')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Square feet must be positive'),
    handleValidationErrors
];

/**
 * Search validation rules
 */
export const validateSearch = [
    query('minRent')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Min rent must be positive'),
    query('maxRent')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Max rent must be positive'),
    query('radius')
        .optional()
        .isFloat({ min: 0.1, max: 50 })
        .withMessage('Radius must be 0.1-50 km'),
    query('latitude')
        .optional()
        .isFloat()
        .withMessage('Valid latitude required'),
    query('longitude')
        .optional()
        .isFloat()
        .withMessage('Valid longitude required'),
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be positive'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: VALIDATION.MAX_IMAGES })
        .withMessage('Limit must be 1-100'),
    handleValidationErrors
];

/**
 * Review validation rules
 */
export const validateCreateReview = [
    body('rating')
        .isInt({ min: 1, max: 5 })
        .withMessage('Rating must be 1-5'),
    body('comment')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Comment must be 10-1000 characters'),
    body('propertyId')
        .isInt({ min: 1 })
        .withMessage('Valid property ID required'),
    handleValidationErrors
];

/**
 * Inquiry validation rules
 */
export const validateCreateInquiry = [
    body('message')
        .trim()
        .isLength({ min: 10, max: 1000 })
        .withMessage('Message must be 10-1000 characters'),
    body('propertyId')
        .isInt({ min: 1 })
        .withMessage('Valid property ID required'),
    body('preferredViewingDate')
        .optional()
        .isISO8601()
        .withMessage('Valid date required'),
    handleValidationErrors
];

/**
 * Payment validation rules
 */
export const validateInitiatePayment = [
    body('amount')
        .isFloat({ min: 1 })
        .withMessage('Amount must be positive'),
    body('phoneNumber')
        .matches(VALIDATION.PHONE_REGEX)
        .withMessage('Valid Kenyan phone number required (+254XXXXXXXXX)'),
    body('propertyId')
        .isInt({ min: 1 })
        .withMessage('Valid property ID required'),
    body('paymentType')
        .trim()
        .notEmpty()
        .withMessage('Payment type required'),
    handleValidationErrors
];