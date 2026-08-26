/**
 * @file Custom Error Handler Classes
 * @description Centralized error handling with custom error classes
 */
import { IErrorResponse } from '../types';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    constructor(message: string, statusCode?: number, isOperational?: boolean);
    toJSON(): IErrorResponse;
}
export declare class ValidationError extends AppError {
    errors: Record<string, string>;
    constructor(message: string, errors?: Record<string, string>);
    toJSON(): IErrorResponse;
}
export declare class AuthenticationError extends AppError {
    constructor(message?: string);
}
export declare class AuthorizationError extends AppError {
    constructor(message?: string);
}
export declare class NotFoundError extends AppError {
    constructor(resource?: string);
}
export declare class ConflictError extends AppError {
    constructor(message: string);
}
export declare class ServerError extends AppError {
    constructor(message?: string);
}
//# sourceMappingURL=errorHandler.d.ts.map