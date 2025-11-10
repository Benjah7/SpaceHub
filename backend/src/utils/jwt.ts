import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
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
    const payload: TokenPayload = { userId, email, role };
    const options: SignOptions = { 
        expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn']
    };

    return jwt.sign(payload, JWT_SECRET, options);
};

/**
 * Verify JWT token
 */
export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

/**
 * Decode JWT token without verification
 */
export const decodeToken = (token: string): TokenPayload | null => {
    return jwt.decode(token) as TokenPayload | null;
};