/**
 * Application constants
 */

export const USER_ROLES = {
    TENANT: 'TENANT',
    OWNER: 'OWNER',
    ADMIN: 'ADMIN'
} as const;

export const PROPERTY_STATUS = {
    AVAILABLE: 'AVAILABLE',
    RENTED: 'RENTED',
    PENDING: 'PENDING',
    INACTIVE: 'INACTIVE'
} as const;

export const PROPERTY_TYPES = {
    RETAIL: 'RETAIL',
    OFFICE: 'OFFICE',
    KIOSK: 'KIOSK',
    STALL: 'STALL'
} as const;

export const PAYMENT_STATUS = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    REFUNDED: 'REFUNDED'
} as const;

export const INQUIRY_STATUS = {
    PENDING: 'PENDING',
    RESPONDED: 'RESPONDED',
    CLOSED: 'CLOSED'
} as const;

export const VERIFICATION_STATUS = {
    UNVERIFIED: 'UNVERIFIED',
    PENDING: 'PENDING',
    VERIFIED: 'VERIFIED',
    REJECTED: 'REJECTED'
} as const;

export const CACHE_KEYS = {
    PROPERTY_DETAIL: (id: number) => `property:${id}`,
    PROPERTY_LIST: 'properties:list',
    SEARCH_RESULTS: (query: string) => `search:${query}`,
    USER_FAVORITES: (userId: number) => `favorites:${userId}`,
    NEIGHBORHOODS: 'neighborhoods:all'
} as const;

export const CACHE_DURATIONS = {
    SHORT: 300, // 5 minutes
    MEDIUM: 600, // 10 minutes
    LONG: 1800, // 30 minutes
    VERY_LONG: 3600 // 1 hour
} as const;

export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100
} as const;

export const VALIDATION = {
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_PROPERTY_NAME_LENGTH: 3,
    MAX_PROPERTY_NAME_LENGTH: 200,
    MIN_DESCRIPTION_LENGTH: 20,
    MAX_DESCRIPTION_LENGTH: 5000,
    MAX_IMAGES: 10,
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    PHONE_REGEX: /^\+254[0-9]{9}$/,
    NAIROBI_BOUNDS: {
        minLat: -1.444471,
        maxLat: -1.163332,
        minLng: 36.650002,
        maxLng: 37.103818
    }
} as const;