/**
 * @file Authentication Controller
 * @description Handle user registration, login, and authentication
 */
import { Request, Response } from 'express';
/**
 * Register new user
 * POST /api/auth/register
 */
export declare const register: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Login user
 * POST /api/auth/login
 */
export declare const login: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Get current user profile
 * GET /api/auth/me
 */
export declare const getCurrentUser: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Update user profile
 * PUT /api/auth/profile
 */
export declare const updateProfile: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Change password
 * POST /api/auth/change-password
 */
export declare const changePassword: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=authController.d.ts.map