import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Container } from 'inversify';
import { TYPES } from '@config/types';

/**
 * Interface for socket authentication data
 */
interface SocketAuthData {
  token?: string;
}

/**
 * Interface for decoded JWT token data
 */
interface DecodedToken {
  sub?: string;
  id?: string;
  email?: string;
  roles?: string[];
  [key: string]: any;
}

/**
 * Creates a middleware for Socket.IO to authenticate users using JWT
 * @param container Inversify container for dependency injection
 * @returns Socket.IO middleware function
 */
export const createSocketAuthMiddleware = (container: Container) => {
  // Get environment config that contains JWT settings
  const config = container.get<any>(TYPES.IEnvironmentConfig);
  const secret = config.jwtSecret;

  return (socket: Socket, next: (err?: Error) => void) => {
    try {
      // Try to get token from socket handshake auth
      let token = socket.handshake.auth?.token;

      // If not in auth, try to get from authorization header
      if (!token && socket.handshake.headers.authorization) {
        const authHeader = socket.handshake.headers.authorization;
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          token = parts[1];
        }
      }

      // If no token found, return authentication error
      if (!token) {
        return next(new Error('Authentication required'));
      }

      try {
        // Verify JWT token
        const decoded = jwt.verify(token, secret);

        // Add user data to socket
        if (decoded && typeof decoded === 'object') {
          socket.data.user = {
            id: decoded.sub || decoded.id || '',
            email: decoded.email || '',
            roles: Array.isArray(decoded.roles) ? decoded.roles : [],
            ...decoded
          };
        }

        next();
      } catch (error) {
        // Handle different JWT error types
        let message = 'Invalid token';

        if (error instanceof jwt.TokenExpiredError) {
          message = 'Token expired';
        } else if (error instanceof jwt.JsonWebTokenError) {
          message = 'Invalid token format';
        }

        next(new Error(message));
      }
    } catch (error) {
      // Handle any unexpected errors
      next(new Error('Authentication failed'));
    }
  };
};

/**
 * Creates a middleware for Socket.IO to check user roles
 * @param roles Array of required roles
 * @returns Socket.IO middleware function
 */
export const createSocketRolesMiddleware = (roles: string[]) => {
  return (socket: Socket, next: (err?: Error) => void) => {
    // Check if user is authenticated
    if (!socket.data.user) {
      return next(new Error('User not authenticated'));
    }

    // Check if user has any of the required roles
    const userRoles = socket.data.user.roles || [];
    const hasRequiredRoles = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRoles) {
      return next(new Error('Insufficient permissions'));
    }

    // If user has required roles, proceed
    next();
  };
}; 