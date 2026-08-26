// Q. WHAT ARE CONTROLLERS IN EXPRESS?
// ANS: Controllers contain the actual business logic of the application. After routes receive a request, they delegate the work to controllers. 
// Controllers process incoming data, interact with databases/models, perform validation, execute application logic, and send responses back to the client. 
// They help keep routes clean by separating logic from routing definitions.

// Example:

// const getUsers = async (req, res) => {
//   const users = await User.find();

//   res.json(users);
// };

// Here the controller:
// * fetches data from database
// * processes logic
// * sends JSON response



const Post = require('../models/Post');
const User = require('../models/User');

// .populate() EXAMPLE - From Post Side
// Get all posts with author details populated
exports.getAllPostsWithAuthors = async (req, res) => {
  try {
    // .populate('author') replaces author ID with actual user document
    const posts = await Post.find().populate('author', 'name email');
    
    res.json({
      success: true,
      message: 'Posts with author details',
      data: posts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// .populate() WITH MULTIPLE LEVELS
// Deep population if needed
exports.getAllPostsDetailedView = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate({
        path: 'author',
        select: 'name email city'
      })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Create Post
exports.createPost = async (req, res) => {
  try {
    const { title, content, author, tags } = req.body;
    
    const post = await Post.create({
      title,
      content,
      author,
      tags
    });
    
    // After creating post, add it to user's posts array
    if (author) {
      await User.findByIdAndUpdate(
        author,
        { $push: { posts: post._id } },  // Add post ID to user's posts array
        { new: true }
      );
    }
    
    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: post
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Get Single Post with Author
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findById(id).populate('author');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({
      success: true,
      data: post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update Post using findByIdAndUpdate()
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const post = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author');
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Delete Post using findByIdAndDelete()
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByIdAndDelete(id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    // Remove post ID from user's posts array
    await User.findByIdAndUpdate(
      post.author,
      { $pull: { posts: post._id } },  // Remove post ID from user's posts array
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Post deleted successfully',
      deletedPost: post
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Publish Multiple Posts using updateMany()
exports.publishPostsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    
    const result = await Post.updateMany(
      { author: authorId, published: false },
      { published: true }
    );
    
    res.json({
      success: true,
      message: 'Posts published',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Get Posts with Pagination & Sorting
exports.getPaginatedPosts = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const skip = (page - 1) * limit;
    
    const posts = await Post.find()
      .select('title content author likes createdAt')   // Select fields
      .populate('author', 'name email')                 // Populate author
      .sort({ createdAt: -1 })                          // Sort newest first
      .skip(skip)
      .limit(parseInt(limit))
      .lean();
    
    const totalCount = await Post.countDocuments();
    
    res.json({
      success: true,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount,
      data: posts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete Old Unpublished Posts
exports.deleteOldUnpublishedPosts = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await Post.deleteMany({
      published: false,
      createdAt: { $lt: thirtyDaysAgo }
    });
    
    res.json({
      success: true,
      message: 'Old unpublished posts deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
