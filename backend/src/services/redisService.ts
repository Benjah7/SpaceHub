import { createClient } from 'redis';

const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis Client Error:', err));
client.on('connect', () => console.log('✅ Redis connected'));

// Connect to Redis
client.connect().catch(err => {
    console.error('Failed to connect to Redis:', err);
});

export class RedisService {
    /**
     * Get value from cache
     */
    static async get(key: string): Promise<any> {
        try {
            const data = await client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Redis get error:', error);
            return null;
        }
    }

    /**
     * Set value in cache with expiry
     */
    static async set(key: string, value: any, expirySeconds: number = 3600): Promise<void> {
        try {
            await client.setEx(key, expirySeconds, JSON.stringify(value));
        } catch (error) {
            console.error('Redis set error:', error);
        }
    }

    /**
     * Delete key from cache
     */
    static async del(key: string): Promise<void> {
        try {
            await client.del(key);
        } catch (error) {
            console.error('Redis del error:', error);
        }
    }

    /**
     * Delete multiple keys by pattern
     */
    static async invalidatePattern(pattern: string): Promise<void> {
        try {
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
            }
        } catch (error) {
            console.error('Redis invalidatePattern error:', error);
        }
    }

    /**
     * Check if key exists
     */
    static async exists(key: string): Promise<boolean> {
        try {
            const result = await client.exists(key);
            return result === 1;
        } catch (error) {
            console.error('Redis exists error:', error);
            return false;
        }
    }

    /**
     * Increment value
     */
    static async incr(key: string): Promise<number> {
        try {
            return await client.incr(key);
        } catch (error) {
            console.error('Redis incr error:', error);
            return 0;
        }
    }

    /**
     * Set expiry on existing key
     */
    static async expire(key: string, seconds: number): Promise<void> {
        try {
            await client.expire(key, seconds);
        } catch (error) {
            console.error('Redis expire error:', error);
        }
    }
}