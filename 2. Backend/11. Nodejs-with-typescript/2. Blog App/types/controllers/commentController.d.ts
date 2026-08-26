/**
 * @file Comment Controller
 * @description Handle blog comments with nested replies support
 */
import { Request, Response } from 'express';
/**
 * Add comment to a blog post
 * POST /api/blogs/:blogId/comments
 */
export declare const addComment: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Get comments for a blog post with pagination
 * GET /api/blogs/:blogId/comments
 */
export declare const getComments: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Get replies to a specific comment
 * GET /api/comments/:commentId/replies
 */
export declare const getCommentReplies: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Update comment
 * PUT /api/comments/:commentId
 */
export declare const updateComment: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Delete comment
 * DELETE /api/comments/:commentId
 */
export declare const deleteComment: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Admin: Get all comments (approved and pending)
 * GET /api/admin/comments
 */
export declare const getAllComments: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Admin: Approve/Reject comment
 * PATCH /api/admin/comments/:commentId/approve
 */
export declare const approveComment: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=commentController.d.ts.map