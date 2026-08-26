/**
 * @file Blog Routes
 * @description Routes for blog CRUD, search, and filtering operations
 */

import { Router } from 'express';
import * as blogController from '@/controllers/blogController';
import { verifyToken, verifyTokenOptional } from '@/middleware/authMiddleware';
import { isAuthenticated } from '@/middleware/roleAuth';

const router = Router();

// Public routes
router.get('/', verifyTokenOptional, blogController.getAllBlogs);
router.get('/:id', verifyTokenOptional, blogController.getBlog);

// Protected routes
router.post('/', verifyToken, isAuthenticated, blogController.createBlog);
router.get('/user/my-blogs', verifyToken, isAuthenticated, blogController.getMyBlogs);
router.put('/:id', verifyToken, isAuthenticated, blogController.updateBlog);
router.delete('/:id', verifyToken, isAuthenticated, blogController.deleteBlog);
router.patch('/:id/publish', verifyToken, isAuthenticated, blogController.togglePublish);

export default router;
