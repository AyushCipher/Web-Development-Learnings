/**
 * @file Global Error Handling Middleware
 * @description Centralized error handler for the application
 */
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errorHandler';
/**
 * Global error handling middleware
 */
export declare const errorHandler: (error: Error | AppError, req: Request, res: Response, next: NextFunction) => void;
/**
 * 404 Not Found middleware
 */
export declare const notFound: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Async handler wrapper to catch errors in async route handlers
 */
export declare const asyncHandler: (fn: (req: Request | any, res: Response, next: NextFunction) => Promise<void>) => (req: Request | any, res: Response, next: NextFunction) => void;
export default errorHandler;
//# sourceMappingURL=errorHandler.d.ts.map