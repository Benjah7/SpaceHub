import { ApiError } from '@/types';
import toast from 'react-hot-toast';

interface ValidationError {
  field?: string;
  param?: string;
  msg?: string;
  message?: string;
}

export class ErrorHandler {
  /**
   * Main error handling method
   */
  static handle(error: unknown, fallbackMessage = 'An error occurred'): ValidationError[] | null {
    const apiError = error as ApiError;
    
    // Handle field-level validation errors
    if (apiError.errors) {
      return this.handleValidationErrors(apiError.errors);
    }
    
    // Handle HTTP status code errors
    this.handleStatusCodeError(apiError, fallbackMessage);
    
    return null;
  }

  /**
   * Handle validation errors from backend
   */
  private static handleValidationErrors(errors: any): ValidationError[] {
    if (!Array.isArray(errors)) {
      toast.error('Validation failed');
      return [];
    }

    const validationErrors: ValidationError[] = [];

    errors.forEach((err: any) => {
      let fieldName = '';
      let message = '';

      // Handle express-validator format
      if (err.param && err.msg) {
        fieldName = err.param;
        message = err.msg;
      }
      // Handle custom format
      else if (err.field && err.message) {
        fieldName = err.field;
        message = err.message;
      }
      // Handle plain string errors
      else if (typeof err === 'string') {
        message = err;
      }

      if (fieldName && message) {
        toast.error(`${this.formatFieldName(fieldName)}: ${message}`, {
          duration: 4000,
        });
        validationErrors.push({ field: fieldName, message });
      } else if (message) {
        toast.error(message);
      }
    });

    return validationErrors;
  }

  /**
   * Handle errors based on HTTP status code
   */
  private static handleStatusCodeError(apiError: ApiError, fallbackMessage: string): void {
    const statusCode = apiError.statusCode || 500;
    const message = apiError.message || fallbackMessage;

    switch (statusCode) {
      case 400:
        toast.error(message || 'Invalid request. Please check your input.');
        break;

      case 401:
        toast.error('Please log in to continue.');
        // Redirect handled by API client interceptor
        break;

      case 403:
        toast.error('You do not have permission to perform this action.');
        break;

      case 404:
        toast.error(message || 'The requested resource was not found.');
        break;

      case 409:
        toast.error(message || 'This resource already exists.');
        break;

      case 422:
        toast.error(message || 'Validation failed. Please check your input.');
        break;

      case 429:
        toast.error('Too many requests. Please try again later.');
        break;

      case 500:
        toast.error('Server error. Our team has been notified.');
        console.error('Server error:', apiError);
        break;

      case 503:
        toast.error('Service temporarily unavailable. Please try again later.');
        break;

      default:
        toast.error(message || fallbackMessage);
    }
  }

  /**
   * Format field name for display
   */
  private static formatFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .replace(/_/g, ' ')
      .trim();
  }

  /**
   * Handle network errors
   */
  static handleNetworkError(): void {
    toast.error('Network error. Please check your connection and try again.');
  }

  /**
   * Handle timeout errors
   */
  static handleTimeout(): void {
    toast.error('Request timed out. Please try again.');
  }

  /**
   * Parse validation errors into form-compatible format
   */
  static parseValidationErrors(errors: any): Record<string, string> {
    if (!Array.isArray(errors)) return {};

    return errors.reduce((acc, err) => {
      const field = err.param || err.field;
      const message = err.msg || err.message;
      
      if (field && message) {
        acc[field] = message;
      }
      
      return acc;
    }, {} as Record<string, string>);
  }
}
