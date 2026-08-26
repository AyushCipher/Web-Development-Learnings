/**
 * @file Global Error Handling Middleware
 * @description Centralized error handler for the application
 */

import { Request, Response, NextFunction } from 'express';
import { AppError, ServerError } from '@/utils/errorHandler';
import logger from '@/utils/logger';
import config from '@/config/env';

/**
 * Global error handling middleware
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let appError = error;

  // Handle unexpected errors
  if (!(error instanceof AppError)) {
    appError = new ServerError(error.message);
  }

  const err = appError as AppError;

  // Log error
  if (err.statusCode >= 500) {
    logger.error('Internal Server Error', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
    });
  } else {
    logger.warn(`${err.statusCode} ${err.message}`, {
      path: req.path,
      method: req.method,
    });
  }

  // Send response
  res.status(err.statusCode).json({
    success: false,
    statusCode: err.statusCode,
    message: err.message,
    ...(config.isDevelopment && { stack: err.stack }),
    ...(err instanceof AppError && 'errors' in err && { errors: (err as any).errors }),
  });
};

/**
 * 404 Not Found middleware
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new AppError(
    `Route ${req.originalUrl} not found`,
    404
  );
  next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request | any, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request | any, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default errorHandler;
