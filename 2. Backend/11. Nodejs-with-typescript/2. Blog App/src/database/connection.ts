/**
 * @file MongoDB Connection
 * @description Establish connection to MongoDB using Mongoose
 */

import mongoose, { Connection } from 'mongoose';
import config from '@/config/env';
import logger from '@/utils/logger';

let mongoConnection: Connection | null = null;

export const connectDatabase = async (): Promise<Connection> => {
  try {
    if (mongoConnection) {
      logger.debug('Using existing MongoDB connection');
      return mongoConnection;
    }

    logger.info('Connecting to MongoDB...');

    const conn = await mongoose.connect(config.mongodbUri, {
      serverSelectionTimeoutMS: 5000,
    });

    mongoConnection = conn.connection;
    logger.info('MongoDB connected successfully', { 
      host: conn.connection.host 
    });

    return conn.connection;
  } catch (error) {
    logger.error('MongoDB connection failed', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (mongoConnection) {
      await mongoose.disconnect();
      mongoConnection = null;
      logger.info('MongoDB disconnected');
    }
  } catch (error) {
    logger.error('MongoDB disconnection failed', error);
    throw error;
  }
};

export const getDatabase = (): Connection | null => {
  return mongoConnection;
};

export default connectDatabase;
