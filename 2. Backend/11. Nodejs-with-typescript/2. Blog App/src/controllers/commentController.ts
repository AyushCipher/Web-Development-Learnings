/**
 * @file Comment Controller
 * @description Handle blog comments with nested replies support
 */

import { Request, Response } from 'express';
import { Comment } from '@/models/Comment';
import { Blog } from '@/models/Blog';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
} from '@/utils/errorHandler';
import { asyncHandler } from '@/middleware/errorHandler';
import { ICommentResponse, IPaginatedResponse } from '@/types';

/**
 * Format comment response
 */
const formatCommentResponse = (comment: any): ICommentResponse => {
  return {
    _id: comment._id.toString(),
    content: comment.content,
    author: {
      _id: comment.author._id.toString(),
      username: comment.author.username,
      email: comment.author.email,
      firstName: comment.author.firstName,
      lastName: comment.author.lastName,
      role: comment.author.role,
    },
    blog: comment.blog._id.toString() || comment.blog,
    parentComment: comment.parentComment?.toString(),
    isApproved: comment.isApproved,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
};

/**
 * Add comment to a blog post
 * POST /api/blogs/:blogId/comments
 */
export const addComment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const { userId } = (req as any).user;
  const { content, parentCommentId } = req.body;

  // Validation
  if (!content || content.trim().length === 0) {
    throw new ValidationError('Comment content is required', {
      content: 'Comment cannot be empty',
    });
  }

  // Check if blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new NotFoundError('Blog');
  }

  // If parentCommentId provided, verify parent comment exists
  if (parentCommentId) {
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment) {
      throw new NotFoundError('Parent comment');
    }
    if (parentComment.blog.toString() !== blogId) {
      throw new ValidationError('Parent comment does not belong to this blog', {
        parentCommentId: 'Invalid parent comment',
      });
    }
  }

  // Create comment
  const comment = await Comment.create({
    content: content.trim(),
    author: userId,
    blog: blogId,
    parentComment: parentCommentId || null,
  });

  // Populate author
  await comment.populate('author', '-password');
  await comment.populate('blog', 'title');

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Comment added successfully',
    data: formatCommentResponse(comment),
  });
});

/**
 * Get comments for a blog post with pagination
 * GET /api/blogs/:blogId/comments
 */
export const getComments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { blogId } = req.params;
  const { page = 1, limit = 10, parentOnly = 'true' } = req.query;

  // Validation
  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
  const isParentOnly = parentOnly === 'true';

  // Check if blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    throw new NotFoundError('Blog');
  }

  // Build query
  const query: any = {
    blog: blogId,
    isApproved: true,
  };

  // Get only top-level comments if parentOnly is true
  if (isParentOnly) {
    query.parentComment = null;
  }

  // Count total
  const totalComments = await Comment.countDocuments(query);

  // Get comments
  const comments = await Comment.find(query)
    .populate('author', '-password')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .lean();

  const totalPages = Math.ceil(totalComments / limitNum);

  const response: IPaginatedResponse<ICommentResponse> = {
    success: true,
    data: comments.map(formatCommentResponse),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: totalComments,
      pages: totalPages,
    },
  };

  res.status(200).json(response);
});

/**
 * Get replies to a specific comment
 * GET /api/comments/:commentId/replies
 */
export const getCommentReplies = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { commentId } = req.params;
    const { page = 1, limit = 5 } = req.query;

    // Validation
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 5));

    // Check if parent comment exists
    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      throw new NotFoundError('Comment');
    }

    // Get replies
    const totalReplies = await Comment.countDocuments({
      parentComment: commentId,
      isApproved: true,
    });

    const replies = await Comment.find({
      parentComment: commentId,
      isApproved: true,
    })
      .populate('author', '-password')
      .sort({ createdAt: 1 })
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .lean();

    const totalPages = Math.ceil(totalReplies / limitNum);

    const response: IPaginatedResponse<ICommentResponse> = {
      success: true,
      data: replies.map(formatCommentResponse),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalReplies,
        pages: totalPages,
      },
    };

    res.status(200).json(response);
  }
);

/**
 * Update comment
 * PUT /api/comments/:commentId
 */
export const updateComment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const { userId } = (req as any).user;
  const { content } = req.body;

  // Validation
  if (!content || content.trim().length === 0) {
    throw new ValidationError('Comment content is required', {
      content: 'Comment cannot be empty',
    });
  }

  // Find comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment');
  }

  // Check authorization
  if (
    comment.author.toString() !== userId &&
    (req as any).user.role !== 'admin'
  ) {
    throw new AuthorizationError('You can only update your own comments');
  }

  // Update comment
  comment.content = content.trim();
  await comment.save();

  // Populate for response
  await comment.populate('author', '-password');

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Comment updated successfully',
    data: formatCommentResponse(comment),
  });
});

/**
 * Delete comment
 * DELETE /api/comments/:commentId
 */
export const deleteComment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { commentId } = req.params;
  const { userId } = (req as any).user;

  // Find comment
  const comment = await Comment.findById(commentId);
  if (!comment) {
    throw new NotFoundError('Comment');
  }

  // Check authorization
  if (
    comment.author.toString() !== userId &&
    (req as any).user.role !== 'admin'
  ) {
    throw new AuthorizationError('You can only delete your own comments');
  }

  // Delete comment and all its replies
  await Comment.deleteOne({ _id: commentId });
  await Comment.deleteMany({ parentComment: commentId });

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Comment deleted successfully',
  });
});

/**
 * Admin: Get all comments (approved and pending)
 * GET /api/admin/comments
 */
export const getAllComments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { page = 1, limit = 20, approved } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));

  const query: any = {};

  if (approved !== undefined) {
    query.isApproved = approved === 'true';
  }

  const totalComments = await Comment.countDocuments(query);
  const comments = await Comment.find(query)
    .populate('author', '-password')
    .populate('blog', 'title')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .lean();

  const totalPages = Math.ceil(totalComments / limitNum);

  const response: IPaginatedResponse<ICommentResponse> = {
    success: true,
    data: comments.map(formatCommentResponse),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: totalComments,
      pages: totalPages,
    },
  };

  res.status(200).json(response);
});

/**
 * Admin: Approve/Reject comment
 * PATCH /api/admin/comments/:commentId/approve
 */
export const approveComment = asyncHandler(
  async (req: Request, res: Response): Promise<void> => {
    const { commentId } = req.params;
    const { approved } = req.body;

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { isApproved: approved },
      { new: true }
    ).populate('author', '-password');

    if (!comment) {
      throw new NotFoundError('Comment');
    }

    res.status(200).json({
      success: true,
      statusCode: 200,
      message: `Comment ${approved ? 'approved' : 'rejected'} successfully`,
      data: formatCommentResponse(comment),
    });
  }
);
