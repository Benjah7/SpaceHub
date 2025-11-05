/**
 * Standard API response formatter
 */
export class ApiResponse {
    /**
     * Success response
     */
    static success(data: any, message: string = 'Success') {
        return {
            success: true,
            message,
            data
        };
    }

    /**
     * Error response
     */
    static error(message: string, errors?: any) {
        return {
            success: false,
            message,
            errors
        };
    }

    /**
     * Paginated response
     */
    static paginated(data: any[], pagination: PaginationInfo, message: string = 'Success') {
        return {
            success: true,
            message,
            data,
            pagination
        };
    }
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public errors?: any
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

interface PaginationInfo {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}