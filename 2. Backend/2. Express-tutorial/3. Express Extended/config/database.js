/**
 * MONGODB DATABASE CONFIGURATION
 * Intermediate-level setup with connection pooling, error handling, and best practices
 */

const mongoose = require('mongoose');
// 1. CONNECTION CONFIGURATION

const mongoConfig = {
  // MongoDB Connection String
  // Format: mongodb+srv://username:password@cluster.mongodb.net/database
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/express-adv',
  
  // Connection Options
  options: {
    // Connection Pooling
    maxPoolSize: 10,              // Maximum number of sockets in connection pool
    minPoolSize: 5,               // Minimum number of sockets in pool
    socketTimeoutMS: 45000,       // Socket timeout
    serverSelectionTimeoutMS: 5000, // Server selection timeout
    
    // Retry Logic
    retryWrites: true,            // Automatic retry for writes
    retryReads: true,             // Automatic retry for reads
    
    // Authentication
    authSource: 'admin',          // Authentication database
    
    // Connection
    connectTimeoutMS: 10000,
    
    // Other
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
};

// ============================================================================
// 2. CONNECTION & ERROR HANDLING
// ============================================================================

/**
 * Establish MongoDB connection with error handling
 */
async function connectDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(mongoConfig.uri, mongoConfig.options);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📍 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🖥️  Host: ${mongoose.connection.host}`);
    
    // Setup event listeners
    setupConnectionListeners();
    
    return mongoose.connection;
    
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
}

/**
 * Setup MongoDB connection event listeners
 */
function setupConnectionListeners() {
  const connection = mongoose.connection;
  
  // Connection success
  connection.on('connected', () => {
    console.log('✅ Mongoose connected to MongoDB');
  });
  
  // Connection error
  connection.on('error', (err) => {
    console.error('❌ Mongoose connection error:', err);
  });
  
  // Disconnected
  connection.on('disconnected', () => {
    console.log('⚠️  Mongoose disconnected from MongoDB');
  });
  
  // Reconnecting
  connection.on('reconnected', () => {
    console.log('🔄 Mongoose reconnected to MongoDB');
  });
  
  // Connection timeout
  connection.on('timeout', () => {
    console.error('⏱️  MongoDB connection timeout');
  });
}

// ============================================================================
// 3. EXAMPLE SCHEMA WITH INDEXES
// ============================================================================

/**
 * Example User schema with proper indexing
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true  // Index for faster queries
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'users'
});

// Create indexes for common queries
userSchema.index({ email: 1 });           // Single field index
userSchema.index({ createdAt: -1 });      // Sort by recent
userSchema.index({ email: 1, createdAt: -1 }); // Compound index

// Prevent re-indexing on every connection
userSchema.set('autoIndex', false);

const User = mongoose.model('User', userSchema);

// ============================================================================
// 4. DATABASE HEALTH CHECK
// ============================================================================

/**
 * Check MongoDB connection health
 * Useful for health endpoints
 */
async function checkDatabaseHealth() {
  try {
    // Ping database
    await mongoose.connection.db.admin().ping();
    
    // Get connection stats
    const stats = {
      isConnected: mongoose.connection.readyState === 1,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.db.databaseName,
      collections: (await mongoose.connection.db.listCollections().toArray()).length
    };
    
    return { healthy: true, stats };
    
  } catch (error) {
    return {
      healthy: false,
      error: error.message
    };
  }
}

// ============================================================================
// 5. CONNECTION STATES
// ============================================================================

/**
 * Mongoose Connection States:
 * 0 - disconnected
 * 1 - connected
 * 2 - connecting
 * 3 - disconnecting
 */
const connectionStates = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting'
};

function getConnectionState() {
  return connectionStates[mongoose.connection.readyState];
}

// ============================================================================
// 6. GRACEFUL SHUTDOWN
// ============================================================================

/**
 * Gracefully close MongoDB connection on app shutdown
 */
async function disconnectDatabase() {
  try {
    console.log('🔌 Disconnecting from MongoDB...');
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', disconnectDatabase);
process.on('SIGTERM', disconnectDatabase);

// ============================================================================
// 7. MIGRATION EXAMPLE (For Replica Set)
// ============================================================================

/**
 * For production, use MongoDB Replica Sets for high availability
 * 
 * Connection String with Replica Set:
 * mongodb+srv://user:pass@host1,host2,host3/?replicaSet=rs0
 * 
 * Features:
 * - Automatic failover
 * - Read scaling
 * - Transactions support
 */
const replicaSetConfig = `
// With Replica Set, connection string becomes:
mongodb+srv://username:password@cluster0.example.mongodb.net/express-adv?replicaSet=rs0

// Read preferences:
db.collection.find().readPref('secondary');  // Read from replica
db.collection.find().readPref('primary');    // Read from primary

// Write concern:
db.collection.insertOne(doc, { writeConcern: { w: 'majority' } });
`;

module.exports = {
  mongoConfig,
  connectDatabase,
  setupConnectionListeners,
  checkDatabaseHealth,
  disconnectDatabase,
  User,
  getConnectionState,
  connectionStates,
  replicaSetConfig
};
