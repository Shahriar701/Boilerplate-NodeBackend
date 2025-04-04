import { Request, Response } from 'express';
import { ApiError, errorMiddleware } from './error.middleware';

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
    it('should handle ApiError correctly', () => {
      const error = ApiError.badRequest('Bad Request', { field: 'Field error' });
      
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Bad Request',
        errors: { field: 'Field error' }
      });
    });

    it('should handle ValidationError correctly', () => {
      const error = new Error('Validation Error');
      error.name = 'ValidationError';
      (error as any).errors = { field: 'Field error' };
      
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Validation Error',
        errors: { field: 'Field error' }
      });
    });

    it('should handle UnauthorizedError correctly', () => {
      const error = new Error('Token expired');
      error.name = 'UnauthorizedError';
      
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Token expired'
      });
    });

    it('should handle generic errors as internal server errors', () => {
      const error = new Error('Unknown error');
      
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Internal Server Error'
      });
    });

    it('should include stack trace in development mode', () => {
      // Change NODE_ENV to development for this test
      process.env.NODE_ENV = 'development';
      
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          stack: 'Error stack trace'
        })
      );
    });

    it('should not include stack trace in production mode', () => {
      // Ensure NODE_ENV is production for this test
      process.env.NODE_ENV = 'production';
      
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      errorMiddleware(error, mockRequest as Request, mockResponse as Response, nextFunction);
      
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.not.objectContaining({
          stack: expect.anything()
        })
      );
    });
  });
}); 