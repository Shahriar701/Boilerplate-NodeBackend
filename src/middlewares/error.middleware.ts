import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '@/utils/response.util';

/**
 * Custom error class for API errors with status code
 */
export class ApiError extends Error {
  statusCode: number;
  errors?: Record<string, string>;

  constructor(message: string, statusCode: number, errors?: Record<string, string>) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = 'ApiError';
  }

  static badRequest(message = 'Bad Request', errors?: Record<string, string>): ApiError {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Not Found'): ApiError {
    return new ApiError(message, 404);
  }

  static conflict(message = 'Conflict', errors?: Record<string, string>): ApiError {
    return new ApiError(message, 409, errors);
  }

  static internal(message = 'Internal Server Error'): ApiError {
    return new ApiError(message, 500);
  }
}

/**
 * Global error handler middleware
 * Uses ResponseUtil to ensure a consistent response format across the application
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): Response => {
  console.error(`[ERROR] ${err.message}`, err);

  // Preserve the original error's stack trace for development mode
  const stack = err.stack;

  // Handle specific error types
  if (err instanceof ApiError) {
    // Use appropriate ResponseUtil method based on error status code
    switch (err.statusCode) {
      case 400:
        return ResponseUtil.badRequest(res, err, err.errors);
      case 401:
        return ResponseUtil.unauthorized(res, err);
      case 403:
        return ResponseUtil.forbidden(res, err);
      case 404:
        return ResponseUtil.notFound(res, err);
      default:
        return ResponseUtil.serverError(res, err);
    }
  } else if (err.name === 'ValidationError') {
    // Handle validation errors
    // This assumes the validation error has a structure with errors property
    // Adjust according to your validation library
    return ResponseUtil.badRequest(res, err, (err as any).errors);
  } else if (err.name === 'UnauthorizedError') {
    // Handle auth errors
    return ResponseUtil.unauthorized(res, err);
  }

  // For generic errors, we want to use a standardized message but preserve the stack trace
  const genericError = new Error('Internal Server Error');
  genericError.stack = stack; // Preserve the original stack trace

  // Use a standardized message for generic errors to maintain consistency
  return ResponseUtil.serverError(res, genericError);
}; 