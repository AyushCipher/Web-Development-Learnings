/**
 * @file Blog Controller
 * @description Handle blog CRUD operations, pagination, search, and filtering
 */

import { Request, Response } from 'express';
import { Blog } from '@/models/Blog';
import { User } from '@/models/User';
import {
  ValidationError,
  NotFoundError,
  AuthorizationError,
  AppError,
} from '@/utils/errorHandler';
import { asyncHandler } from '@/middleware/errorHandler';
import {
  IBlogCreate,
  IBlogUpdate,
  IBlogResponse,
  IPaginatedResponse,
  IBlogQueryFilters,
} from '@/types';

/**
 * Format blog response with populated author
 */
const formatBlogResponse = (blog: any): IBlogResponse => {
  return {
    _id: blog._id.toString(),
    title: blog.title,
    content: blog.content,
    slug: blog.slug,
    author: {
      _id: String((blog.author as any)?._id || blog.author),
      username: (blog.author as any)?.username || '',
      email: (blog.author as any)?.email || '',
      firstName: (blog.author as any)?.firstName || '',
      lastName: (blog.author as any)?.lastName || '',
      role: (blog.author as any)?.role || 'user',
    },
    category: blog.category,
    tags: blog.tags,
    coverImage: blog.coverImage,
    description: blog.description,
    readTime: blog.readTime,
    views: blog.views,
    isPublished: blog.isPublished,
    createdAt: blog.createdAt,
    updatedAt: blog.updatedAt,
  };
};

/**
 * Create new blog post
 * POST /api/blogs
 */
export const createBlog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).user;
  const { title, content, category, tags, coverImage, description, isPublished } = req.body;

  // Validation
  const errors: Record<string, string> = {};

  if (!title) errors.title = 'Title is required';
  if (!content) errors.content = 'Content is required';
  if (!category) errors.category = 'Category is required';
  if (!description) errors.description = 'Description is required';

  if (title && title.length < 5) errors.title = 'Title must be at least 5 characters';
  if (content && content.length < 50) errors.content = 'Content must be at least 50 characters';
  if (description && description.length < 20)
    errors.description = 'Description must be at least 20 characters';

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  // Create blog
  const blog = await Blog.create({
    title,
    content,
    category,
    tags: tags || [],
    coverImage,
    description,
    author: userId,
    isPublished: isPublished || false,
  });

  // Populate author
  await blog.populate('author', '-password');

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'Blog created successfully',
    data: formatBlogResponse(blog),
  });
});

/**
 * Get all blogs with pagination, search, and filtering
 * GET /api/blogs
 */
export const getAllBlogs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const {
    page = 1,
    limit = 10,
    search,
    category,
    tags,
    author,
    sortBy = 'newest',
  } = req.query;

  // Validation
  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));

  // Build query
  const query: any = { isPublished: true };

  // Search in title, content, description, tags
  if (search) {
    query.$text = { $search: search as string };
  }

  // Filter by category
  if (category) {
    query.category = category;
  }

  // Filter by author
  if (author) {
    query.author = author;
  }

  // Filter by tags
  if (tags) {
    const tagsArray = (tags as string).split(',').map((t) => t.trim().toLowerCase());
    query.tags = { $in: tagsArray };
  }

  // Sort options
  let sortQuery: any = { createdAt: -1 }; // Default: newest

  switch (sortBy) {
    case 'oldest':
      sortQuery = { createdAt: 1 };
      break;
    case 'popular':
      sortQuery = { views: -1 };
      break;
    case 'trending':
      // Blogs created in last 7 days, sorted by views
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      query.createdAt = { $gte: sevenDaysAgo };
      sortQuery = { views: -1 };
      break;
  }

  // Execute query
  const totalBlogs = await Blog.countDocuments(query);
  const blogs = await Blog.find(query)
    .populate('author', '-password')
    .sort(sortQuery)
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .lean();

  const totalPages = Math.ceil(totalBlogs / limitNum);

  const response: IPaginatedResponse<IBlogResponse> = {
    success: true,
    data: blogs.map(formatBlogResponse),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: totalBlogs,
      pages: totalPages,
    },
  };

  res.status(200).json(response);
});

/**
 * Get single blog by ID or slug
 * GET /api/blogs/:id
 */
export const getBlog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Try to find by ID first, then by slug
  let blog = await Blog.findById(id).populate('author', '-password');

  if (!blog) {
    blog = await Blog.findOne({ slug: id }).populate('author', '-password');
  }

  if (!blog) {
    throw new NotFoundError('Blog');
  }

  // Increment view count
  blog.views += 1;
  await blog.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Blog retrieved successfully',
    data: formatBlogResponse(blog),
  });
});

/**
 * Update blog post
 * PUT /api/blogs/:id
 */
export const updateBlog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId } = (req as any).user;
  const { title, content, category, tags, coverImage, description, isPublished } = req.body;

  // Find blog
  let blog = await Blog.findById(id);

  if (!blog) {
    throw new NotFoundError('Blog');
  }

  // Check authorization
  const authorId = String((blog.author as any)?._id || blog.author);
  if (authorId !== userId && (req as any).user.role !== 'admin') {
    throw new AuthorizationError('You can only update your own blogs');
  }

  // Update blog
  const updateData: IBlogUpdate = {};
  if (title) updateData.title = title;
  if (content) updateData.content = content;
  if (category) updateData.category = category;
  if (tags) updateData.tags = tags;
  if (coverImage !== undefined) updateData.coverImage = coverImage;
  if (description) updateData.description = description;
  if (isPublished !== undefined) updateData.isPublished = isPublished;

  blog = await Blog.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate('author', '-password');

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Blog updated successfully',
    data: formatBlogResponse(blog),
  });
});

/**
 * Delete blog post
 * DELETE /api/blogs/:id
 */
export const deleteBlog = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId } = (req as any).user;

  // Find blog
  const blog = await Blog.findById(id);

  if (!blog) {
    throw new NotFoundError('Blog');
  }

  // Check authorization
  if (blog.author.toString() !== userId && (req as any).user.role !== 'admin') {
    throw new AuthorizationError('You can only delete your own blogs');
  }

  // Delete blog
  await Blog.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Blog deleted successfully',
  });
});

/**
 * Get user's own blogs
 * GET /api/blogs/my-blogs
 */
export const getMyBlogs = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).user;
  const { page = 1, limit = 10 } = req.query;

  const pageNum = Math.max(1, parseInt(page as string) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));

  const totalBlogs = await Blog.countDocuments({ author: userId });
  const blogs = await Blog.find({ author: userId })
    .populate('author', '-password')
    .sort({ createdAt: -1 })
    .limit(limitNum)
    .skip((pageNum - 1) * limitNum)
    .lean();

  const totalPages = Math.ceil(totalBlogs / limitNum);

  const response: IPaginatedResponse<IBlogResponse> = {
    success: true,
    data: blogs.map(formatBlogResponse),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: totalBlogs,
      pages: totalPages,
    },
  };

  res.status(200).json(response);
});

/**
 * Publish/Unpublish blog
 * PATCH /api/blogs/:id/publish
 */
export const togglePublish = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { userId } = (req as any).user;

  const blog = await Blog.findById(id).populate('author', '-password');

  if (!blog) {
    throw new NotFoundError('Blog');
  }

  // Check authorization
  const authorId = String((blog.author as any)?._id || blog.author);
  if (authorId !== userId && (req as any).user.role !== 'admin') {
    throw new AuthorizationError('You can only publish/unpublish your own blogs');
  }

  blog.isPublished = !blog.isPublished;
  await blog.save();

  res.status(200).json({
    success: true,
    statusCode: 200,
    message: `Blog ${blog.isPublished ? 'published' : 'unpublished'} successfully`,
    data: formatBlogResponse(blog),
  });
});
