/**
 * @file Role-Based Authorization Middleware
 * @description Check user roles for protected routes
 */
import { Response, NextFunction } from 'express';
import { IAuthenticatedRequest } from '../types';
/**
 * Middleware to check if user is authenticated
 */
export declare const isAuthenticated: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Higher-order function to check specific roles
 */
export declare const hasRole: (...allowedRoles: string[]) => (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to check if user is admin
 */
export declare const isAdmin: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to check if user is regular user
 */
export declare const isUser: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Middleware to check if user is the resource owner or admin
 */
export declare const isOwnerOrAdmin: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
declare const _default: {
    isAuthenticated: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
    hasRole: (...allowedRoles: string[]) => (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
    isAdmin: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
    isUser: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
    isOwnerOrAdmin: (req: IAuthenticatedRequest, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=roleAuth.d.ts.map