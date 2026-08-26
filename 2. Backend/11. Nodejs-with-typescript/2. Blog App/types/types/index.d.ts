/**
 * @file TypeScript Interfaces and Types for Multi-User Blog API
 * @description Central location for all TypeScript types and interfaces
 */
import { Request } from 'express';
export interface IUser {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
    bio?: string;
    role: 'user' | 'admin';
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IUserRegister {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
}
export interface IUserLogin {
    email: string;
    password: string;
}
export interface IUserResponse {
    _id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profileImage?: string;
    bio?: string;
}
export interface IAuthResponse {
    success: boolean;
    message: string;
    token?: string;
    user?: IUserResponse;
}
export interface IJWTPayload {
    userId: string;
    email: string;
    role: string;
}
export interface IAuthRequest {
    userId: string;
    email: string;
    role: string;
}
export interface IBlog {
    title: string;
    content: string;
    slug: string;
    author: string;
    category: string;
    tags: string[];
    coverImage?: string;
    description: string;
    readTime?: number;
    views: number;
    isPublished: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface IBlogCreate {
    title: string;
    content: string;
    category: string;
    tags: string[];
    coverImage?: string;
    description: string;
    isPublished?: boolean;
}
export interface IBlogUpdate {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
    coverImage?: string;
    description?: string;
    isPublished?: boolean;
}
export interface IBlogResponse {
    _id: string;
    title: string;
    content: string;
    slug: string;
    author: IUserResponse;
    category: string;
    tags: string[];
    coverImage?: string;
    description: string;
    readTime: number;
    views: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IComment {
    content: string;
    author: string;
    blog: string;
    parentComment?: string;
    isApproved: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface ICommentCreate {
    content: string;
    parentComment?: string;
}
export interface ICommentResponse {
    _id: string;
    content: string;
    author: IUserResponse;
    blog: string;
    parentComment?: string;
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IPaginationQuery {
    page: number;
    limit: number;
}
export interface IBlogQueryFilters {
    search?: string;
    category?: string;
    tags?: string[];
    author?: string;
    isPublished?: boolean;
    sortBy?: 'newest' | 'oldest' | 'popular' | 'trending';
}
export interface IPaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
    message?: string;
}
export interface IErrorResponse {
    success: false;
    message: string;
    statusCode: number;
    errors?: Record<string, string>;
}
export interface IApiResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data?: T;
}
export interface IAuthenticatedRequest extends Request {
    user?: IAuthRequest;
}
export interface IValidationError {
    field: string;
    message: string;
}
//# sourceMappingURL=index.d.ts.map