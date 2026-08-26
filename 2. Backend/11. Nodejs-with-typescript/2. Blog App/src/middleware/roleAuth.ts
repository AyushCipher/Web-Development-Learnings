/**
 * @file Role-Based Authorization Middleware
 * @description Check user roles for protected routes
 */

import { Response, NextFunction, Request } from 'express';
import { AuthorizationError, AuthenticationError } from '@/utils/errorHandler';
import { IAuthenticatedRequest } from '@/types';

/**
 * Middleware to check if user is authenticated
 */
export const isAuthenticated = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AuthenticationError('Please login to access this resource'));
  }
  next();
};

/**
 * Higher-order function to check specific roles
 */
export const hasRole = (...allowedRoles: string[]) => {
  return (
    req: IAuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      return next(new AuthenticationError('Please login to access this resource'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new AuthorizationError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
};

/**
 * Middleware to check if user is admin
 */
export const isAdmin = hasRole('admin');

/**
 * Middleware to check if user is regular user
 */
export const isUser = hasRole('user', 'admin');

/**
 * Middleware to check if user is the resource owner or admin
 */
export const isOwnerOrAdmin = (
  req: IAuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    return next(new AuthenticationError('Please login to access this resource'));
  }

  // Get resource owner ID from query params or route params
  const resourceOwnerId = (req as Request).params.userId || (req as Request).query.userId;

  if (
    req.user.role !== 'admin' &&
    req.user.userId !== String(resourceOwnerId)
  ) {
    return next(
      new AuthorizationError('You do not have permission to access this resource')
    );
  }

  next();
};

export default {
  isAuthenticated,
  hasRole,
  isAdmin,
  isUser,
  isOwnerOrAdmin,
};
