/**
 * @file Environment Configuration
 * @description Load and validate environment variables
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  appName: process.env.APP_NAME || 'Multi-User Blog API',
  apiVersion: process.env.API_VERSION || 'v1',

  // Database
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/blog-api',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  jwtExpire: process.env.JWT_EXPIRE || '7d',

  // Environment checks
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};

// Validate critical environment variables
export const validateConfig = (): void => {
  const requiredEnvs = ['MONGODB_URI', 'JWT_SECRET'];
  
  if (config.isProduction) {
    const missingEnvs = requiredEnvs.filter((env) => !process.env[env]);
    
    if (missingEnvs.length > 0) {
      throw new Error(
        `Missing required environment variables in production: ${missingEnvs.join(', ')}`
      );
    }
  }
};

export default config;
