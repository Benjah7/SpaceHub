import 'dotenv/config'; // Load env first
import jwt, { SignOptions } from 'jsonwebtoken';

/**
 * Validate and get JWT secret from environment
 */
const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    
    if (!secret || secret.trim() === '') {
        throw new Error(
            'JWT_SECRET is not defined in environment variables. ' +
            'Please set JWT_SECRET in your .env file with a secure value (minimum 32 characters).'
        );
    }

    if (secret.length < 32) {
        throw new Error(
            'JWT_SECRET must be at least 32 characters long for security. ' +
            'Current length: ' + secret.length
        );
    }

    return secret;
};

const JWT_SECRET = getJwtSecret();
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface TokenPayload {
    userId: number;
    email: string;
    role: string;
}

/**
 * Generate JWT token
 */
export const generateToken = (userId: number, email: string, role: string): string => {
    try {
        const payload: TokenPayload = { userId, email, role };
        const options: SignOptions = { 
            expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn']
        };

        return jwt.sign(payload, JWT_SECRET, options);
    } catch (error) {
        console.error('JWT Generation Error:', error);
        throw new Error('Failed to generate authentication token');
    }
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): TokenPayload => {
    try {
        return jwt.verify(token, JWT_SECRET) as TokenPayload;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token has expired');
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw error;
    }
};

/**
 * Decode JWT token without verification
 */
export const decodeToken = (token: string): TokenPayload | null => {
    try {
        return jwt.decode(token) as TokenPayload | null;
    } catch (error) {
        console.error('JWT Decode Error:', error);
        return null;
    }
};