const mongoose = require('mongoose');

// Database Connection
const connectDB = async () => {
  try {
    // Using MongoDB local instance or MongoDB Atlas
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/express-mvc';
    
    await mongoose.connect(uri);
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error('Database Connection Error:', error);
    process.exit(1);
  }
};

module.exports = connectDB;
