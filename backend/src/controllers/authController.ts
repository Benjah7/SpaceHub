import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AuthService } from '../services/authService';
import { CloudinaryService } from '../services/cloudinaryService';

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await AuthService.register(req.body);

    // Set token in cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json(
        ApiResponse.success({ user, token }, 'User registered successfully')
    );
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
    const { user, token } = await AuthService.login(req.body);

    // Set token in cookie
    res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json(
        ApiResponse.success({ user, token }, 'Login successful')
    );
});

/**
 * Logout user
 * POST /api/auth/logout
 */
export const logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie('token');
    res.json(
        ApiResponse.success(null, 'Logout successful')
    );
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.getProfile(req.user!.id);

    res.json(
        ApiResponse.success(user, 'Profile retrieved successfully')
    );
});

/**
 * Update user profile
 * PUT /api/auth/me
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
    const user = await AuthService.updateProfile(req.user!.id, req.body);

    res.json(
        ApiResponse.success(user, 'Profile updated successfully')
    );
});

/**
 * Upload profile image
 * POST /api/auth/me/image
 */
export const uploadProfileImage = asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
        res.status(400).json(
            ApiResponse.error('No image file provided')
        );
        return; // Add explicit return
    }

    const user = await CloudinaryService.uploadProfileImage(req.file, req.user!.id);

    res.json(
        ApiResponse.success(user, 'Profile image uploaded successfully')
    );
});

/**
 * Delete user account
 * DELETE /api/auth/me
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
    await AuthService.deleteAccount(req.user!.id);

    res.clearCookie('token');
    res.json(
        ApiResponse.success(null, 'Account deleted successfully')
    );
});