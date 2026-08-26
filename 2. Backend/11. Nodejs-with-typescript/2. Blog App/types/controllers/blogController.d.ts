/**
 * @file Blog Controller
 * @description Handle blog CRUD operations, pagination, search, and filtering
 */
import { Request, Response } from 'express';
/**
 * Create new blog post
 * POST /api/blogs
 */
export declare const createBlog: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Get all blogs with pagination, search, and filtering
 * GET /api/blogs
 */
export declare const getAllBlogs: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Get single blog by ID or slug
 * GET /api/blogs/:id
 */
export declare const getBlog: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Update blog post
 * PUT /api/blogs/:id
 */
export declare const updateBlog: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Delete blog post
 * DELETE /api/blogs/:id
 */
export declare const deleteBlog: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Get user's own blogs
 * GET /api/blogs/my-blogs
 */
export declare const getMyBlogs: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
/**
 * Publish/Unpublish blog
 * PATCH /api/blogs/:id/publish
 */
export declare const togglePublish: (req: Request | any, res: Response, next: import("express").NextFunction) => void;
//# sourceMappingURL=blogController.d.ts.map