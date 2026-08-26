const express = require('express');
const connectDB = require('./config/db');

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Express MVC with MongoDB Queries',
    endpoints: {
      users: '/api/users',
      posts: '/api/posts'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({
    success: false,
    error: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

// Q. WHAT IS MVC ARCHITECTURE?
// ANS: MVC (Model View Controller) is a software architectural pattern used to separate application concerns into organized layers. 
// It improves code maintainability, scalability, readability, reusability, and team collaboration. 
// Without MVC, all routing, database logic, and responses would exist inside a single file, creating tightly coupled messy code that becomes difficult to debug and scale as applications grow.