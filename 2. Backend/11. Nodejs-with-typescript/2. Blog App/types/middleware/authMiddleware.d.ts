/**
 * @file Authentication Middleware
 * @description Verify JWT tokens and extract user information
 */
import { Response, NextFunction, Request } from 'express';
import { IAuthenticatedRequest } from '../types';
/**
 * Verify JWT token and attach user info to request
 */
export declare const verifyToken: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Optional token verification - doesn't fail if no token provided
 */
export declare const verifyTokenOptional: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Extract token from request
 */
export declare const extractToken: (req: Request) => string | null;
/**
 * Generate JWT token
 */
export declare const generateToken: (userId: string, email: string, role: string) => string;
export default verifyToken;
//# sourceMappingURL=authMiddleware.d.ts.map