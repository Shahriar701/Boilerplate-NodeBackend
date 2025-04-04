import { Request, Response, NextFunction } from 'express';

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
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  console.error(`[ERROR] ${err.message}`, err);

  // Default error response
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: Record<string, string> | undefined;

  // Handle specific error types
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err.name === 'ValidationError') {
    // Handle validation errors (e.g., from a validation library)
    statusCode = 400;
    message = 'Validation Error';
    // This assumes the validation error has a structure with errors property
    // Adjust according to your validation library
    errors = (err as any).errors;
  } else if (err.name === 'UnauthorizedError') {
    // Handle auth errors
    statusCode = 401;
    message = err.message || 'Unauthorized';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    // Only include stack trace in development environment
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}; 