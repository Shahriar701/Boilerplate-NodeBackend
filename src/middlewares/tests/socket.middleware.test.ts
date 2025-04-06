import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Container } from 'inversify';
import { createSocketAuthMiddleware, createSocketRolesMiddleware } from '@middlewares/socket.middleware';
import { TYPES } from '@config/types';

// Mock jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
  TokenExpiredError: class TokenExpiredError extends Error { },
  JsonWebTokenError: class JsonWebTokenError extends Error { }
}));

describe('Socket Middleware', () => {
  let container: Container;
  let mockSocket: any; // Using any to bypass TypeScript strict typing
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

    // Mock socket with minimal required properties
    mockSocket = {
      handshake: {
        auth: {},
        headers: {},
        // Add additional required properties
        time: new Date().toISOString(),
        address: '127.0.0.1',
        xdomain: false,
        secure: true,
        issued: new Date().getTime(),
        url: '/',
        query: {}
      },
      data: {}
    };

    nextFunction = jest.fn();
  });

  describe('createSocketAuthMiddleware', () => {
    it('should return error if no token is provided', () => {
      // Arrange
      const middleware = createSocketAuthMiddleware(container);

      // Act
      middleware(mockSocket as Socket, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
      expect(nextFunction.mock.calls[0][0].message).toBe('Authentication required');
    });

    it('should authenticate using token from auth object', () => {
      // Arrange
      mockSocket.handshake.auth = { token: 'valid-token' };
      const decodedToken = { id: '123', email: 'user@example.com', roles: ['user'] };
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

      const middleware = createSocketAuthMiddleware(container);

      // Act
      middleware(mockSocket as Socket, nextFunction);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(mockSocket.data.user).toEqual(expect.objectContaining({
        id: decodedToken.id,
        email: decodedToken.email,
        roles: decodedToken.roles
      }));
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should authenticate using token from authorization header', () => {
      // Arrange
      mockSocket.handshake.headers = { authorization: 'Bearer valid-token' };
      const decodedToken = { id: '123', email: 'user@example.com', roles: ['user'] };
      (jwt.verify as jest.Mock).mockReturnValue(decodedToken);

      const middleware = createSocketAuthMiddleware(container);

      // Act
      middleware(mockSocket as Socket, nextFunction);

      // Assert
      expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
      expect(mockSocket.data.user).toEqual(expect.objectContaining({
        id: decodedToken.id,
        email: decodedToken.email,
        roles: decodedToken.roles
      }));
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should return error if token is expired', () => {
      // Arrange
      mockSocket.handshake.auth = { token: 'expired-token' };
      const error = new (jwt.TokenExpiredError as any)('Token expired');
      (jwt.verify as jest.Mock).mockImplementation(() => { throw error; });

      const middleware = createSocketAuthMiddleware(container);

      // Act
      middleware(mockSocket as Socket, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
      expect(nextFunction.mock.calls[0][0].message).toBe('Token expired');
    });

    it('should return error if token format is invalid', () => {
      // Arrange
      mockSocket.handshake.auth = { token: 'invalid-token' };
      const error = new (jwt.JsonWebTokenError as any)('Invalid token');
      (jwt.verify as jest.Mock).mockImplementation(() => { throw error; });

      const middleware = createSocketAuthMiddleware(container);

      // Act
      middleware(mockSocket as Socket, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
      expect(nextFunction.mock.calls[0][0].message).toBe('Invalid token format');
    });

    it('should return error if token verification throws a generic error', () => {
      // Arrange
      mockSocket.handshake.auth = { token: 'problematic-token' };
      (jwt.verify as jest.Mock).mockImplementation(() => { throw new Error('Generic error'); });

      const middleware = createSocketAuthMiddleware(container);

      // Act
      middleware(mockSocket as Socket, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
      expect(nextFunction.mock.calls[0][0].message).toBe('Invalid token');
    });
  });

  describe('createSocketRolesMiddleware', () => {
    it('should return error if user is not authenticated', () => {
      // Arrange
      const middleware = createSocketRolesMiddleware(['admin']);

      // Act
      middleware(mockSocket as Socket, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
      expect(nextFunction.mock.calls[0][0].message).toBe('User not authenticated');
    });

    it('should return error if user does not have required roles', () => {
      // Arrange
      mockSocket.data.user = { id: '123', email: 'user@example.com', roles: ['user'] };
      const middleware = createSocketRolesMiddleware(['admin']);

      // Act
      middleware(mockSocket as Socket, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalledWith(expect.any(Error));
      expect(nextFunction.mock.calls[0][0].message).toBe('Insufficient permissions');
    });

    it('should call next() if user has required roles', () => {
      // Arrange
      mockSocket.data.user = { id: '123', email: 'user@example.com', roles: ['admin'] };
      const middleware = createSocketRolesMiddleware(['admin']);

      // Act
      middleware(mockSocket as Socket, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalledWith();
    });

    it('should call next() if user has at least one of the required roles', () => {
      // Arrange
      mockSocket.data.user = { id: '123', email: 'user@example.com', roles: ['user', 'editor'] };
      const middleware = createSocketRolesMiddleware(['admin', 'editor']);

      // Act
      middleware(mockSocket as Socket, nextFunction);

      // Assert
      expect(nextFunction).toHaveBeenCalledWith();
    });
  });
}); 