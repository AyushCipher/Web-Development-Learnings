/**
 * @file Authentication Controller
 * @description Handle user registration, login, and authentication
 */

import { Request, Response } from 'express';
import { User } from '@/models/User';
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from '@/utils/errorHandler';
import { generateToken } from '@/middleware/authMiddleware';
import { asyncHandler } from '@/middleware/errorHandler';
import { IUserRegister, IUserLogin, IUserResponse, IAuthResponse } from '@/types';

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const isStrongPassword = (password: string): boolean => {
  return password.length >= 6;
};

/**
 * Format user response
 */
const formatUserResponse = (user: any): IUserResponse => {
  return {
    _id: user._id.toString(),
    username: user.username,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    profileImage: user.profileImage,
    bio: user.bio,
  };
};

/**
 * Register new user
 * POST /api/auth/register
 */
export const register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, firstName, lastName } = req.body;

  // Validation
  const errors: Record<string, string> = {};

  if (!username) errors.username = 'Username is required';
  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';
  if (!firstName) errors.firstName = 'First name is required';
  if (!lastName) errors.lastName = 'Last name is required';

  if (email && !isValidEmail(email)) errors.email = 'Invalid email format';
  if (password && !isStrongPassword(password))
    errors.password = 'Password must be at least 6 characters';

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }],
  });

  if (existingUser) {
    throw new ConflictError(
      'User with this email or username already exists'
    );
  }

  // Create new user
  const user = await User.create({
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    password,
    firstName,
    lastName,
  });

  // Generate token
  const token = generateToken(user._id.toString(), user.email, user.role);

  const response: IAuthResponse = {
    success: true,
    message: 'User registered successfully',
    token,
    user: formatUserResponse(user),
  };

  res.status(201).json(response);
});

/**
 * Login user
 * POST /api/auth/login
 */
export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Validation
  const errors: Record<string, string> = {};

  if (!email) errors.email = 'Email is required';
  if (!password) errors.password = 'Password is required';

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  // Find user and include password field
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check password
  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch) {
    throw new AuthenticationError('Invalid email or password');
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AuthenticationError('Your account has been deactivated');
  }

  // Generate token
  const token = generateToken(user._id.toString(), user.email, user.role);

  const response: IAuthResponse = {
    success: true,
    message: 'Login successful',
    token,
    user: formatUserResponse(user),
  };

  res.status(200).json(response);
});

/**
 * Get current user profile
 * GET /api/auth/me
 */
export const getCurrentUser = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).user;

  const user = await User.findById(userId);

  if (!user) {
    throw new NotFoundError('User');
  }

  res.status(200).json({
    success: true,
    message: 'User profile retrieved',
    data: formatUserResponse(user),
  });
});

/**
 * Update user profile
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).user;
  const { firstName, lastName, bio, profileImage } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    {
      ...(firstName && { firstName }),
      ...(lastName && { lastName }),
      ...(bio !== undefined && { bio }),
      ...(profileImage && { profileImage }),
    },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new NotFoundError('User');
  }

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: formatUserResponse(user),
  });
});

/**
 * Change password
 * POST /api/auth/change-password
 */
export const changePassword = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { userId } = (req as any).user;
  const { currentPassword, newPassword, confirmPassword } = req.body;

  // Validation
  const errors: Record<string, string> = {};

  if (!currentPassword) errors.currentPassword = 'Current password is required';
  if (!newPassword) errors.newPassword = 'New password is required';
  if (!confirmPassword) errors.confirmPassword = 'Password confirmation is required';
  if (newPassword && !isStrongPassword(newPassword))
    errors.newPassword = 'New password must be at least 6 characters';
  if (newPassword !== confirmPassword)
    errors.confirmPassword = 'Passwords do not match';

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  // Get user with password field
  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new NotFoundError('User');
  }

  // Verify current password
  const isPasswordMatch = await user.comparePassword(currentPassword);

  if (!isPasswordMatch) {
    throw new AuthenticationError('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
});
