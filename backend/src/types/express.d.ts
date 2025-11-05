import { User as PrismaUser } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                email: string;
                name: string;
                role: string;
                verified: boolean;
            };
        }
    }
}

export { };