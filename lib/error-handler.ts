/**
 * Error handling utilities for better user experience
 */

export interface ApiError {
  response?: {
    data?: {
      detail?: string;
      message?: string;
      errors?: string[];
    };
    status?: number;
  };
  message?: string;
}

/**
 * Extract user-friendly error message from API error
 */
export function getErrorMessage(error: ApiError, fallbackMessage: string = 'An error occurred'): string {
  // Check for specific error details from API response
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  // Check for validation errors array
  if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    return error.response.data.errors.join(', ');
  }
  
  // Check for HTTP status code specific messages
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return 'Conflict: This resource already exists.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Request failed with status ${error.response.status}.`;
    }
  }
  
  // Fallback to error message or generic message
  return error.message || fallbackMessage;
}

/**
 * Get error type for styling purposes
 */
export function getErrorType(error: ApiError): 'error' | 'warning' | 'info' {
  if (error.response?.status) {
    switch (error.response.status) {
      case 400:
      case 422:
        return 'warning';
      case 401:
      case 403:
        return 'error';
      case 409:
        return 'warning';
      case 429:
        return 'info';
      case 500:
        return 'error';
      default:
        return 'error';
    }
  }
  return 'error';
}

/**
 * Check if error is a specific type
 */
export function isErrorType(error: ApiError, type: string): boolean {
  return error.response?.data?.detail?.toLowerCase().includes(type.toLowerCase()) || 
         error.message?.toLowerCase().includes(type.toLowerCase()) || false;
}
