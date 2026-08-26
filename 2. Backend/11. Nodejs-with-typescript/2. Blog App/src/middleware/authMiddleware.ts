/**
 * @file Authentication Middleware
 * @description Verify JWT tokens and extract user information
 */

import { Response, NextFunction, Request } from 'express';
import jwt from 'jsonwebtoken';
import config from '@/config/env';
import { AuthenticationError } from '@/utils/errorHandler';
import { IAuthenticatedRequest, IJWTPayload } from '@/types';

/**
 * Verify JWT token and attach user info to request
 */
export const verifyToken = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const token = (req as Request).headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AuthenticationError('No token provided. Please provide a valid JWT token.');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as IJWTPayload;

    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AuthenticationError('Invalid token'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AuthenticationError('Token has expired'));
    } else {
      next(error);
    }
  }
};

/**
 * Optional token verification - doesn't fail if no token provided
 */
export const verifyTokenOptional = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = (req as Request).headers.authorization?.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwtSecret) as IJWTPayload;
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

/**
 * Extract token from request
 */
export const extractToken = (req: Request): string | null => {
  const token = req.headers.authorization?.split(' ')[1];
  return token || null;
};

/**
 * Generate JWT token
 */
export const generateToken = (
  userId: string,
  email: string,
  role: string
): string => {
  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    config.jwtSecret,
    {
      expiresIn: config.jwtExpire,
    } as any
  );
};

export default verifyToken;
