import { Request, Response, NextFunction } from 'express';
import { RedisService } from '../services/redisService';

/**
 * Cache middleware
 * Caches GET requests and serves from cache if available
 */
export const cache = (duration: number = 300) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Create cache key from URL and query params
        const key = `cache:${req.originalUrl}`;

        try {
            // Check cache
            const cached = await RedisService.get(key);

            if (cached) {
                return res.json(cached);
            }

            // Store original json method
            const originalJson = res.json.bind(res);

            // Override json method to cache response
            res.json = (data: any) => {
                // Cache the response
                RedisService.set(key, data, duration).catch(err => {
                    console.error('Cache set error:', err);
                });

                // Send response
                return originalJson(data);
            };

            next();
        } catch (error) {
            console.error('Cache middleware error:', error);
            next();
        }
    };
};

/**
 * Cache invalidation middleware
 * Invalidates cache keys matching pattern after successful mutation
 */
export const invalidateCache = (...patterns: string[]) => {
    return async (_req: Request, res: Response, next: NextFunction) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to invalidate cache after response
        res.json = (data: any) => {
            // Only invalidate on successful mutations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300) {
                patterns.forEach(pattern => {
                    RedisService.invalidatePattern(pattern).catch(err => {
                        console.error('Cache invalidation error:', err);
                    });
                });
            }

            return originalJson(data);
        };

        next();
    };
};