import { Request, Response } from 'express';
import { ApiError, errorMiddleware } from '../error.middleware';
import { ResponseUtil } from '@/utils/response.util';

// Mock ResponseUtil methods
jest.mock('@/utils/response.util', () => ({
  ResponseUtil: {
    badRequest: jest.fn().mockReturnValue({ statusCode: 400 }),
    unauthorized: jest.fn().mockReturnValue({ statusCode: 401 }),
    forbidden: jest.fn().mockReturnValue({ statusCode: 403 }),
    notFound: jest.fn().mockReturnValue({ statusCode: 404 }),
    serverError: jest.fn().mockImplementation((res, error) => {
      return { statusCode: 500, error };
    }),
  }
}));

describe('Error Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Mock request, response, next
    mockRequest = {};

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    nextFunction = jest.fn();

    // Set NODE_ENV to production for consistent tests
    process.env.NODE_ENV = 'production';

    // Clear all mocks
    jest.clearAllMocks();
  });

  afterAll(() => {
    // Restore original NODE_ENV
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('ApiError', () => {
    it('should create a custom error with status code', () => {
      const error = new ApiError('Test error', 400);

      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.errors).toBeUndefined();
    });

    it('should create a custom error with errors object', () => {
      const errors = { field: 'Field error' };
      const error = new ApiError('Test error', 400, errors);

      expect(error.errors).toEqual(errors);
    });

    it('should provide static helper methods for common errors', () => {
      const badRequest = ApiError.badRequest('Bad Request');
      expect(badRequest.statusCode).toBe(400);

      const unauthorized = ApiError.unauthorized('Unauthorized');
      expect(unauthorized.statusCode).toBe(401);

      const forbidden = ApiError.forbidden('Forbidden');
      expect(forbidden.statusCode).toBe(403);

      const notFound = ApiError.notFound('Not Found');
      expect(notFound.statusCode).toBe(404);

      const conflict = ApiError.conflict('Conflict');
      expect(conflict.statusCode).toBe(409);

      const internal = ApiError.internal('Internal Server Error');
      expect(internal.statusCode).toBe(500);
    });

    it('should support custom error messages in static methods', () => {
      const badRequest = ApiError.badRequest('Custom bad request');
      expect(badRequest.message).toBe('Custom bad request');
    });

    it('should support validation errors in static methods', () => {
      const errors = { field: 'Field error' };
      const badRequest = ApiError.badRequest('Bad Request', errors);
      expect(badRequest.errors).toEqual(errors);
    });
  });

  describe('errorMiddleware', () => {
    it('should handle ApiError 400 correctly', () => {
      const error = ApiError.badRequest('Bad Request', { field: 'Field error' });

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(ResponseUtil.badRequest).toHaveBeenCalledWith(mockResponse, error, error.errors);
    });

    it('should handle ApiError 401 correctly', () => {
      const error = ApiError.unauthorized('Unauthorized');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(ResponseUtil.unauthorized).toHaveBeenCalledWith(mockResponse, error);
    });

    it('should handle ApiError 403 correctly', () => {
      const error = ApiError.forbidden('Forbidden');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(ResponseUtil.forbidden).toHaveBeenCalledWith(mockResponse, error);
    });

    it('should handle ApiError 404 correctly', () => {
      const error = ApiError.notFound('Not Found');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(ResponseUtil.notFound).toHaveBeenCalledWith(mockResponse, error);
    });

    it('should handle ValidationError correctly', () => {
      const error = new Error('Validation Error');
      error.name = 'ValidationError';
      (error as any).errors = { field: 'Field error' };

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(ResponseUtil.badRequest).toHaveBeenCalledWith(mockResponse, error, (error as any).errors);
    });

    it('should handle UnauthorizedError correctly', () => {
      const error = new Error('Token expired');
      error.name = 'UnauthorizedError';

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(ResponseUtil.unauthorized).toHaveBeenCalledWith(mockResponse, error);
    });

    it('should handle generic errors as internal server errors', () => {
      const error = new Error('Unknown error');

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      expect(ResponseUtil.serverError).toHaveBeenCalled();
      // The middleware converts this to a standardized error with "Internal Server Error" message
      const serverErrorCall = (ResponseUtil.serverError as jest.Mock).mock.calls[0];
      expect(serverErrorCall[1].message).toBe('Internal Server Error');
    });

    it('should preserve the original stack trace in generic errors', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace';

      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

      const serverErrorCall = (ResponseUtil.serverError as jest.Mock).mock.calls[0];
      expect(serverErrorCall[1].stack).toBe('Error stack trace');
    });
  });
}); 