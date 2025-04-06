import { Container } from 'inversify';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { createAuthMiddleware, hasRoles, generateToken } from '../auth.middleware';
import { TYPES } from '@config/types';
import { ResponseUtil } from '@/utils/response.util';
import { ApiError } from '@/middlewares/error.middleware';

// Mock ResponseUtil
jest.mock('@/utils/response.util', () => ({
  ResponseUtil: {
    unauthorized: jest.fn().mockReturnValue({}),
    forbidden: jest.fn().mockReturnValue({})
  }
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  sign: jest.fn(),
  TokenExpiredError: class TokenExpiredError extends Error { },
  JsonWebTokenError: class JsonWebTokenError extends Error { }
}));

describe('Authentication Middleware', () => {
  let container: Container;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Create a mock container
    container = new Container();
    container.bind(TYPES.IEnvironmentConfig).toConstantValue({
      jwtSecret: 'test-secret',
      jwtExpiresIn: '1h'
    });

    // Mock request, response, next
    mockRequest = {
      headers: {},
      user: undefined
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };

    nextFunction = jest.fn();
  });

  describe('createAuthMiddleware', () => {
    it('should return 401 if no authorization header is provided', () => {
      // Arrange
      const middleware = createAuthMiddleware(container);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(ResponseUtil.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({ message: 'No authorization header provided' })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header format is invalid', () => {
      // Arrange
      mockRequest.headers = { authorization: 'Invalid-Format' };
      const middleware = createAuthMiddleware(container);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(ResponseUtil.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          message: 'Authorization header format should be "Bearer {token}"'
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if token is valid', () => {
      // Arrange
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      const decodedToken = { id: '123', email: 'user@example.com', roles: ['user'] };
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

      const middleware = createAuthMiddleware(container);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(mockRequest.user).toEqual(expect.objectContaining({
        id: decodedToken.id,
        email: decodedToken.email,
        roles: decodedToken.roles
      }));
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should return 401 if token is expired', () => {
      // Arrange
      mockRequest.headers = { authorization: 'Bearer expired-token' };
      const error = new (jwt.TokenExpiredError as any)('Token expired');
      (jwt.verify as jest.Mock).mockImplementation(() => { throw error; });

      const middleware = createAuthMiddleware(container);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(ResponseUtil.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({ message: 'Token expired' })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 401 if token format is invalid', () => {
      // Arrange
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      const error = new (jwt.JsonWebTokenError as any)('Invalid token');
      (jwt.verify as jest.Mock).mockImplementation(() => { throw error; });

      const middleware = createAuthMiddleware(container);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(ResponseUtil.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({ message: 'Invalid token format' })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('hasRoles', () => {
    it('should return 401 if user is not authenticated', () => {
      // Arrange
      const middleware = hasRoles(['admin']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(ResponseUtil.unauthorized).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({ message: 'User not authenticated' })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should return 403 if user does not have required roles', () => {
      // Arrange
      mockRequest.user = { id: '123', email: 'user@example.com', roles: ['user'] };
      const middleware = hasRoles(['admin']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(ResponseUtil.forbidden).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({ message: 'Insufficient permissions' })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should call next() if user has required roles', () => {
      // Arrange
      mockRequest.user = { id: '123', email: 'user@example.com', roles: ['admin'] };
      const middleware = hasRoles(['admin']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalled();
    });

    it('should call next() if user has at least one of the required roles', () => {
      // Arrange
      mockRequest.user = { id: '123', email: 'user@example.com', roles: ['user', 'editor'] };
      const middleware = hasRoles(['admin', 'editor']);

      // Act
      middleware(mockRequest as Request, mockResponse as Response, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalled();
    });
  });

  describe('generateToken', () => {
    it('should call jwt.sign with the correct parameters', () => {
      // Arrange
      const payload = { id: '123', email: 'user@example.com' };
      const secret = 'test-secret';
      const expiresIn = '1h';
      (jwt.sign as jest.Mock).mockReturnValue('generated-token');

      // Act
      const result = generateToken(payload, secret, expiresIn);

      // Assert
      expect(jwt.sign).toHaveBeenCalledWith(payload, secret, { expiresIn });
      expect(result).toBe('generated-token');
    });
  });
}); 