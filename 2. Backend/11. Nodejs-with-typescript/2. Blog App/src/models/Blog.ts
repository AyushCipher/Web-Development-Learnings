/**
 * @file Blog Model
 * @description MongoDB Blog Schema and Model with Mongoose
 */

import mongoose, { Schema, Model, Document } from 'mongoose';
import { IBlog } from '@/types';

interface IBlogDocument extends IBlog, Document {}

const blogSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Blog title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters long'],
      maxlength: [200, 'Title must not exceed 200 characters'],
    },
    content: {
      type: String,
      required: [true, 'Blog content is required'],
      minlength: [50, 'Content must be at least 50 characters long'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Author is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Technology',
          'Lifestyle',
          'Travel',
          'Food',
          'Health',
          'Education',
          'Business',
          'Entertainment',
          'Sports',
          'Other',
        ],
        message: 'Please select a valid category',
      },
    },
    tags: {
      type: [String],
      default: [],
      lowercase: true,
    },
    coverImage: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters long'],
      maxlength: [500, 'Description must not exceed 500 characters'],
    },
    readTime: {
      type: Number,
      default: function () {
        // Calculate approximate read time (assuming 200 words per minute)
        const wordCount = (this as any).content.split(/\s+/).length;
        return Math.ceil(wordCount / 200);
      },
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ==================== INDEXES ====================
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ isPublished: 1 });
blogSchema.index({ createdAt: -1 });
blogSchema.index({ views: -1 });
// Text index for search
blogSchema.index({
  title: 'text',
  content: 'text',
  description: 'text',
  tags: 'text',
});

// ==================== MIDDLEWARE ====================
// Auto-generate slug from title
blogSchema.pre('save', function (next) {
  const blog = this as any;
  if (blog.isModified('title')) {
    blog.slug = blog.title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
  next();
});

// ==================== QUERY HELPERS ====================
(blogSchema.query as any).published = function () {
  return this.where({ isPublished: true });
};

(blogSchema.query as any).byAuthor = function (authorId: string) {
  return this.where({ author: authorId });
};

(blogSchema.query as any).byCategory = function (category: string) {
  return this.where({ category });
};

export const Blog = mongoose.model<IBlogDocument>('Blog', blogSchema) as any;
export default Blog;
