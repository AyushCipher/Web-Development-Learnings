/**
 * @file Comment Routes
 * @description Routes for blog comments with nested replies support
 */

import { Router } from 'express';
import * as commentController from '@/controllers/commentController';
import { verifyToken, verifyTokenOptional } from '@/middleware/authMiddleware';
import { isAuthenticated, isAdmin } from '@/middleware/roleAuth';

const router = Router();

// Public routes - Get comments
router.get('/blog/:blogId/comments', verifyTokenOptional, commentController.getComments);
router.get('/:commentId/replies', verifyTokenOptional, commentController.getCommentReplies);

// Protected routes - Add/Update/Delete comments
router.post('/blog/:blogId/comments', verifyToken, isAuthenticated, commentController.addComment);
router.put('/:commentId', verifyToken, isAuthenticated, commentController.updateComment);
router.delete('/:commentId', verifyToken, isAuthenticated, commentController.deleteComment);

// Admin routes
router.get('/admin/comments', verifyToken, isAdmin, commentController.getAllComments);
router.patch(
  '/admin/:commentId/approve',
  verifyToken,
  isAdmin,
  commentController.approveComment
);

export default router;
