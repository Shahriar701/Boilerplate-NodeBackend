import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Container } from 'inversify';
import { TYPES } from '@config/types';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        roles?: string[];
        [key: string]: any;
      };
    }
  }
}

/**
 * Configuration for the auth middleware
 */
export interface AuthConfig {
  secret: string;
  tokenExpiration: string;
  issuer?: string;
  audience?: string;
}

/**
 * Authentication middleware factory
 * @param container Inversify container instance
 * @returns Authentication middleware
 */
export const createAuthMiddleware = (container: Container) => {
  // Get environment config that contains JWT settings
  const config = container.get<any>(TYPES.IEnvironmentConfig);
  const secret = config.jwtSecret;

  /**
   * Middleware to verify JWT tokens in authorization header
   * @param req Express request
   * @param res Express response
   * @param next Express next function
   */
  return (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      res.status(401).json({ message: 'No authorization header provided' });
      return;
    }

    const parts = authHeader.split(' ');
    
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({ message: 'Authorization header format should be "Bearer {token}"' });
      return;
    }

    const token = parts[1];

    try {
      // @ts-ignore - Ignoring type errors with JWT library
      const decoded = jwt.verify(token, secret);

      // Add user data to request object
      if (decoded && typeof decoded === 'object') {
        req.user = {
          id: decoded.sub || decoded.id || '',
          email: decoded.email || '',
          roles: Array.isArray(decoded.roles) ? decoded.roles : [],
          ...decoded
        };
      }
      
      next();
    } catch (error) {
      let message = 'Invalid token';
      
      if (error instanceof jwt.TokenExpiredError) {
        message = 'Token expired';
      } else if (error instanceof jwt.JsonWebTokenError) {
        message = 'Invalid token format';
      }
      
      res.status(401).json({ message });
    }
  };
};

/**
 * Middleware to check if user has specific roles
 * @param roles Array of required roles
 * @returns Express middleware
 */
export const hasRoles = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userRoles = req.user.roles || [];
    const hasRequiredRoles = roles.some(role => userRoles.includes(role));

    if (!hasRequiredRoles) {
      res.status(403).json({ message: 'Insufficient permissions' });
      return;
    }

    next();
  };
};

/**
 * Helper to generate a JWT token
 * @param payload Data to include in the token
 * @param secret Secret key for signing
 * @param expiresIn Token expiration time
 * @returns JWT token string
 */
export const generateToken = (payload: any, secret: string, expiresIn: string): string => {
  // @ts-ignore - Ignoring type errors with JWT library
  return jwt.sign(payload, secret, { expiresIn });
}; 