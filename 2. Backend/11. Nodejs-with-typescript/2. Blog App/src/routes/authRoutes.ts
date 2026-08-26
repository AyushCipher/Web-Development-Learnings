/**
 * @file Authentication Routes
 * @description Routes for user authentication and profile management
 */

import { Router } from 'express';
import * as authController from '@/controllers/authController';
import { verifyToken } from '@/middleware/authMiddleware';
import { isAuthenticated } from '@/middleware/roleAuth';

const router = Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/me', verifyToken, authController.getCurrentUser);
router.put('/profile', verifyToken, authController.updateProfile);
router.post('/change-password', verifyToken, authController.changePassword);

export default router;
