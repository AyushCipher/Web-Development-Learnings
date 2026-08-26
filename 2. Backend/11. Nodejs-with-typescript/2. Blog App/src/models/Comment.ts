/**
 * @file Comment Model
 * @description MongoDB Comment Schema and Model for Blog Comments with nested reply support
 */

import mongoose, { Schema, Model, Document } from 'mongoose';
import { IComment } from '@/types';

interface ICommentDocument extends IComment, Document {}

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      minlength: [1, 'Comment must not be empty'],
      maxlength: [5000, 'Comment must not exceed 5000 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment author is required'],
    },
    blog: {
      type: Schema.Types.ObjectId,
      ref: 'Blog',
      required: [true, 'Blog ID is required'],
    },
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      default: null, // null for top-level comments, populated for replies
    },
    isApproved: {
      type: Boolean,
      default: true, // Set to false if you want to moderate comments
    },
  },
  {
    timestamps: true,
  }
);

// ==================== INDEXES ====================
commentSchema.index({ blog: 1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ blog: 1, parentComment: 1 }); // Compound index for nested comments

// ==================== MIDDLEWARE ====================
// Populate nested replies when fetching comments
commentSchema.pre(/^find/, function (next) {
  // Only populate if explicitly specified in the query
  const options = (this as any).options;
  if (options && options._recursed) {
    return next();
  }
  next();
});

// ==================== QUERY HELPERS ====================
(commentSchema.query as any).approved = function () {
  return this.where({ isApproved: true });
};

(commentSchema.query as any).forBlog = function (blogId: string) {
  return this.where({ blog: blogId });
};

(commentSchema.query as any).topLevel = function () {
  return this.where({ parentComment: null });
};

export const Comment = mongoose.model<ICommentDocument>('Comment', commentSchema) as any;
export default Comment;
