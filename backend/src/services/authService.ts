import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { ApiError } from '../utils/apiResponse';
import { RegisterDTO, LoginDTO } from '../types';

const prisma = new PrismaClient();

export class AuthService {
    /**
     * Register new user
     */
    static async register(data: RegisterDTO) {
        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existingUser) {
            throw new ApiError(409, 'Email already registered');
        }

        // Check phone uniqueness
        const existingPhone = await prisma.user.findFirst({
            where: { phone: data.phone }
        });

        if (existingPhone) {
            throw new ApiError(409, 'Phone number already registered');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                ...data,
                password: hashedPassword
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                verified: true,
                verificationStatus: true,
                createdAt: true
            }
        });

        // Generate token
        const token = generateToken(user.id, user.email, user.role);

        return { user, token };
    }

    /**
     * Login user
     */
    static async login(data: LoginDTO) {
        // Find user
        const user = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (!user) {
            throw new ApiError(401, 'Invalid credentials');
        }

        // Verify password
        const validPassword = await bcrypt.compare(data.password, user.password);

        if (!validPassword) {
            throw new ApiError(401, 'Invalid credentials');
        }

        // Generate token
        const token = generateToken(user.id, user.email, user.role);

        // Return user without password
        const { password, ...userWithoutPassword } = user;

        return { user: userWithoutPassword, token };
    }

    /**
     * Get user profile
     */
    static async getProfile(userId: number) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                verified: true,
                verificationStatus: true,
                bio: true,
                profileImage: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        properties: true,
                        favorites: true,
                        reviews: true,
                        inquiriesSent: true
                    }
                }
            }
        });

        if (!user) {
            throw new ApiError(404, 'User not found');
        }

        return user;
    }

    /**
     * Update user profile
     */
    static async updateProfile(userId: number, data: any) {
        // If password is being updated, hash it
        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                verified: true,
                bio: true,
                profileImage: true,
                updatedAt: true
            }
        });

        return user;
    }

    /**
     * Delete user account
     */
    static async deleteAccount(userId: number) {
        await prisma.user.delete({
            where: { id: userId }
        });

        return { message: 'Account deleted successfully' };
    }
}