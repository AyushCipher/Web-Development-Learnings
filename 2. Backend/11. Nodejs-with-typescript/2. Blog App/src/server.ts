/**
 * @file Main Server Entry Point
 * @description Initialize Express server with all middleware and routes
 */

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// The "@/..." imports throughout this project are a path ALIAS (see
// tsconfig.json's "paths": { "@/*": ["src/*"] }) - TypeScript understands
// them at type-check time, but plain `tsc` does NOT rewrite them in the
// emitted JS, and plain `node` has no idea what "@/config/env" means
// (Cannot find module '@/config/env'). Two different fixes cover the two
// ways this project runs:
//   - `npm run dev` uses ts-node, which is configured (see tsconfig.json's
//     "ts-node" block) to load tsconfig-paths/register and resolve aliases
//     on the fly - no separate build step involved.
//   - `npm run build` (tsc) followed by `npm start` (plain `node
//     dist/server.js`) needs the aliases resolved AHEAD of time instead,
//     which is what `tsc-alias` in the build script does: it rewrites every
//     "@/x" import in the compiled dist/ output into a real relative path.
// Import configuration and utilities
import config, { validateConfig } from '@/config/env';
import logger from '@/utils/logger';
import connectDatabase from '@/database/connection';

// Import middleware
import { errorHandler, notFound } from '@/middleware/errorHandler';

// Import routes
import authRoutes from '@/routes/authRoutes';
import blogRoutes from '@/routes/blogRoutes';
import commentRoutes from '@/routes/commentRoutes';

// Load environment variables
dotenv.config();

// Validate configuration
validateConfig();

const app: Express = express();

// ==================== MIDDLEWARE ====================

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`, {
    query: req.query,
    body: req.body,
  });
  next();
});

// ==================== API ROUTES ====================

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API version info
app.get('/api/info', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    appName: config.appName,
    version: config.apiVersion,
    environment: config.nodeEnv,
  });
});

// API Routes
// config.apiVersion already includes the "v" (env default/.env value is
// "v1", not "1") - a literal "v" here too used to double it up into
// "/api/vv1/...". Bug caught while verifying this project boots correctly.
const apiPrefix = `/api/${config.apiVersion}`;

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/blogs`, blogRoutes);
app.use(`${apiPrefix}/comments`, commentRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ==================== SERVER STARTUP ====================

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Start server
    const server = app.listen(config.port, () => {
      logger.info(`${config.appName} running on port ${config.port}`, {
        environment: config.nodeEnv,
        version: config.apiVersion,
      });

      logger.info('Available endpoints:', {
        health: 'GET /health',
        info: 'GET /api/info',
        auth: `${apiPrefix}/auth`,
        blogs: `${apiPrefix}/blogs`,
        comments: `${apiPrefix}/comments`,
      });
    });

    // Handle server errors
    server.on('error', (error: Error) => {
      logger.error('Server error', error);
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
};

// Start server if this is the main module
if (require.main === module) {
  startServer();
}

export default app;
