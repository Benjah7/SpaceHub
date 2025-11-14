import type { ApiError } from '@/types';
import toast from 'react-hot-toast';

/**
 * Error Handler Utility
 * Centralized error handling for API requests and application errors
 */
export class ErrorHandler {
  /**
   * Handle and display errors
   */
  static handle(error: unknown, customMessage?: string): void {
    console.error('Error:', error);

    if (this.isApiError(error)) {
      this.handleApiError(error, customMessage);
    } else if (error instanceof Error) {
      this.handleGenericError(error, customMessage);
    } else {
      this.handleUnknownError(customMessage);
    }
  }

  /**
   * Handle API errors with detailed messages
   */
  private static handleApiError(error: ApiError, customMessage?: string): void {
    // Show custom message or API error message
    const message = customMessage || error.message || 'An error occurred';
    toast.error(message);

    // Show field-specific errors if available
    if (error.errors && Object.keys(error.errors).length > 0) {
      Object.entries(error.errors).forEach(([field, messages]) => {
        if (Array.isArray(messages)) {
          messages.forEach((msg) => {
            toast.error(`${this.formatFieldName(field)}: ${msg}`, {
              duration: 5000,
            });
          });
        }
      });
    }

    // Log for debugging
    console.error('API Error:', {
      message: error.message,
      statusCode: error.statusCode,
      errors: error.errors,
    });
  }

  /**
   * Handle generic JavaScript errors
   */
  private static handleGenericError(error: Error, customMessage?: string): void {
    const message = customMessage || error.message || 'An unexpected error occurred';
    toast.error(message);

    console.error('Generic Error:', error);
  }

  /**
   * Handle unknown error types
   */
  private static handleUnknownError(customMessage?: string): void {
    const message = customMessage || 'An unexpected error occurred';
    toast.error(message);

    console.error('Unknown Error');
  }

  /**
   * Type guard to check if error is ApiError
   */
  static isApiError(error: unknown): error is ApiError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      'statusCode' in error
    );
  }

  /**
   * Get error message from any error type
   */
  static getErrorMessage(error: unknown): string {
    if (this.isApiError(error)) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred';
  }

  /**
   * Get detailed error information
   */
  static getErrorDetails(error: unknown): {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>;
  } {
    if (this.isApiError(error)) {
      return {
        message: error.message,
        statusCode: error.statusCode,
        errors: error.errors,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }

    return {
      message: 'An unexpected error occurred',
    };
  }

  /**
   * Check if error is a specific HTTP status code
   */
  static isStatusCode(error: unknown, statusCode: number): boolean {
    return this.isApiError(error) && error.statusCode === statusCode;
  }

  /**
   * Check if error is a network error
   */
  static isNetworkError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('fetch') ||
        error.message.toLowerCase().includes('connection')
      );
    }
    return false;
  }

  /**
   * Check if error is a timeout error
   */
  static isTimeoutError(error: unknown): boolean {
    if (error instanceof Error) {
      return (
        error.message.toLowerCase().includes('timeout') ||
        error.message.toLowerCase().includes('timed out')
      );
    }
    return false;
  }

  /**
   * Check if error is an authentication error
   */
  static isAuthError(error: unknown): boolean {
    return this.isStatusCode(error, 401) || this.isStatusCode(error, 403);
  }

  /**
   * Check if error is a validation error
   */
  static isValidationError(error: unknown): boolean {
    return this.isStatusCode(error, 400) || this.isStatusCode(error, 422);
  }

  /**
   * Check if error is a not found error
   */
  static isNotFoundError(error: unknown): boolean {
    return this.isStatusCode(error, 404);
  }

  /**
   * Check if error is a server error
   */
  static isServerError(error: unknown): boolean {
    if (this.isApiError(error)) {
      return error.statusCode >= 500;
    }
    return false;
  }

  /**
   * Format field name for display
   */
  private static formatFieldName(field: string): string {
    return field
      .split(/(?=[A-Z])|_/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Create a user-friendly error message based on status code
   */
  static getStatusMessage(statusCode: number): string {
    const messages: Record<number, string> = {
      400: 'Invalid request. Please check your input.',
      401: 'You need to be logged in to perform this action.',
      403: 'You do not have permission to perform this action.',
      404: 'The requested resource was not found.',
      408: 'Request timeout. Please try again.',
      409: 'This action conflicts with existing data.',
      422: 'Validation failed. Please check your input.',
      429: 'Too many requests. Please slow down.',
      500: 'Server error. Please try again later.',
      502: 'Bad gateway. Please try again later.',
      503: 'Service unavailable. Please try again later.',
      504: 'Gateway timeout. Please try again later.',
    };

    return messages[statusCode] || 'An error occurred. Please try again.';
  }

  /**
   * Handle async errors with optional retry
   */
  static async withRetry<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: unknown;

    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (this.isApiError(error) && error.statusCode >= 400 && error.statusCode < 500) {
          if (error.statusCode !== 429) {
            throw error;
          }
        }

        // Wait before retrying (exponential backoff)
        if (i < retries - 1) {
          await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, i)));
        }
      }
    }

    throw lastError;
  }

  /**
   * Log error to external service (placeholder for future implementation)
   */
  static logToService(error: unknown, context?: Record<string, any>): void {
    // TODO: Implement logging to external service (e.g., Sentry)
    console.error('Error logged:', {
      error: this.getErrorDetails(error),
      context,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Async error boundary wrapper
 */
export async function handleAsync<T>(
  promise: Promise<T>,
  errorHandler?: (error: unknown) => void
): Promise<[T | null, unknown | null]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    if (errorHandler) {
      errorHandler(error);
    } else {
      ErrorHandler.handle(error);
    }
    return [null, error];
  }
}

/**
 * Create error object
 */
export function createError(
  message: string,
  statusCode: number = 500,
  errors?: Record<string, string[]>
): ApiError {
  return {
    message,
    statusCode,
    errors,
  };
}
