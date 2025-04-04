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
 * Authentication middleware factory for Socket.IO
 * @param container Inversify container for accessing configurations
 * @returns Socket.IO middleware function
 */
export const createSocketAuthMiddleware = (container: Container) => {
  // Get environment config that contains JWT settings
  const config = container.get<any>(TYPES.IEnvironmentConfig);
  const secret = config.jwtSecret;

  /**
   * Socket.IO middleware for authentication
   * @param socket Socket instance
   * @param next Next function
   */
  return (socket: Socket, next: (err?: Error) => void): void => {
    try {
      // Get auth token from handshake query parameters or headers
      const auth = socket.handshake.auth as SocketAuthData;
      const token = 
        auth.token || 
        socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      // Verify token
      // @ts-ignore - Ignoring type errors with JWT library
      const decoded = jwt.verify(token, secret);
      
      if (typeof decoded !== 'object') {
        return next(new Error('Invalid token format'));
      }

      // Attach user data to socket
      const tokenData = decoded as DecodedToken;
      socket.data.user = {
        id: tokenData.sub || tokenData.id || '',
        email: tokenData.email || '',
        roles: Array.isArray(tokenData.roles) ? tokenData.roles : [],
        ...tokenData
      };

      return next();
    } catch (error) {
      let message = 'Invalid token';
      
      if (error instanceof jwt.TokenExpiredError) {
        message = 'Token expired';
      } else if (error instanceof jwt.JsonWebTokenError) {
        message = 'Invalid token format';
      }
      
      return next(new Error(message));
    }
  };
};

/**
 * Role-based access control middleware for Socket.IO
 * @param requiredRoles Array of required roles
 * @returns Socket.IO middleware function
 */
export const createSocketRolesMiddleware = (requiredRoles: string[]) => {
  return (socket: Socket, next: (err?: Error) => void): void => {
    const user = socket.data.user;
    
    if (!user) {
      return next(new Error('User not authenticated'));
    }
    
    const userRoles = user.roles || [];
    const hasRequiredRoles = requiredRoles.some(role => userRoles.includes(role));
    
    if (!hasRequiredRoles) {
      return next(new Error('Insufficient permissions'));
    }
    
    return next();
  };
}; 