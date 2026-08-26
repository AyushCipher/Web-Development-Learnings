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



const User = require('../models/User');


// 1️⃣ .find() → Get Multiple Documents
// Used when: Fetching list of data
// Returns: Array of documents
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ age: { $gt: 18 } });
    
    res.json({
      success: true,
      message: 'Users fetched successfully',
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 2️⃣ .findOne() → Get Single Document
// Used when: Fetch one record
// Returns: Single object or null
// Faster than .find() when only one needed
exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const user = await User.findOne({ email: email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User found',
      data: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 3️⃣ .findById() → Get by ID
// Used when: Fetch using _id
// Returns: Single document or null
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 8️⃣ .create() → Insert Data
// Used when: Create new document directly
// Direct insertion without instance
exports.createUser = async (req, res) => {
  try {
    const { name, email, age, city } = req.body;
    
    const user = await User.create({
      name: name,
      email: email,
      age: age,
      city: city
    });
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// 9️⃣ .save() → Save Instance
// Used when: Create new instance and save
// Instance-based approach
exports.createUserWithSave = async (req, res) => {
  try {
    const { name, email, age, city } = req.body;
    
    // Create instance first
    const user = new User({
      name: name,
      email: email,
      age: age,
      city: city
    });
    
    // Then save
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User saved successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// 4️⃣ .findOneAndUpdate() ⭐ MOST IMPORTANT FOR INTERVIEWS
// Find document by condition and update it
// Options: new: true → returns updated doc
exports.updateUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const updateData = req.body;
    
    const user = await User.findOneAndUpdate(
      { email: email },
      updateData,
      { 
        new: true,              // Returns updated document
        runValidators: true     // Runs schema validators
      }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// 5️⃣ .findByIdAndUpdate():- Find by _id and update
// Similar to findOneAndUpdate but specifically for ID
exports.updateUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { 
        new: true,
        runValidators: true
      }
    );
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// 1️⃣6️⃣ .updateOne() / .updateMany():
// Update without returning document
// Used for bulk updates
exports.updateManyUsers = async (req, res) => {
  try {
    // Update all users with age > 25, set isActive to false
    const result = await User.updateMany(
      { age: { $gt: 25 } },
      { isActive: false }
    );
    
    res.json({
      success: true,
      message: 'Multiple users updated',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// 6️⃣ .findOneAndDelete():- Find and delete by condition
exports.deleteUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    
    const user = await User.findOneAndDelete({ email: email });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 7️⃣ .findByIdAndDelete():- Find by _id and delete
exports.deleteUserById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 1️⃣7️⃣ .deleteOne() / .deleteMany()
// Delete without returning document
// Used for bulk delete
exports.deleteInactiveUsers = async (req, res) => {
  try {
    // Delete all inactive users
    const result = await User.deleteMany({ isActive: false });
    
    res.json({
      success: true,
      message: 'Inactive users deleted',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 1️⃣0️⃣ .countDocuments():- Count documents matching condition
exports.countUsers = async (req, res) => {
  try {
    // Count all users with age > 18
    const count = await User.countDocuments({ age: { $gt: 18 } });
    
    res.json({
      success: true,
      message: 'Users counted',
      totalCount: count
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 🔍 1️⃣1️⃣ .select() → Choose Fields
// Select specific fields to retrieve
// .select("-password") excludes fields
exports.getUsersWithSelectedFields = async (req, res) => {
  try {
    // Q. WHY 'name email' INSTEAD OF THE ORIGINAL 'name email -age'?
    // ANS: MongoDB projections must be either pure inclusion (list only
    // the fields you want) or pure exclusion (list only the fields you
    // don't want) - mixing the two in one .select() (naming fields to
    // INCLUDE like name/email, while also trying to EXCLUDE age) is
    // invalid and throws "Cannot do exclusion on field age in inclusion
    // projection" the moment this route runs, which is exactly what live-
    // testing this route caught. Listing only 'name email' already
    // excludes age (and everything else except the always-included _id)
    // as a side effect of being an inclusion projection - no separate
    // exclusion needed.
    const users = await User.find().select('name email');
    
    res.json({
      success: true,
      message: 'Users fetched with selected fields',
      data: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 📦 1️⃣2️⃣ .limit() and .skip() → Pagination
// Skip: number of documents to skip
// Limit: number of documents to return
exports.getPaginatedUsers = async (req, res) => {
  try {
    const page = req.query.page || 1;
    const pageSize = 5;
    const skip = (page - 1) * pageSize;
    
    const users = await User.find()
      .skip(skip)
      .limit(pageSize);
    
    const totalCount = await User.countDocuments();
    const totalPages = Math.ceil(totalCount / pageSize);
    
    res.json({
      success: true,
      currentPage: page,
      totalPages: totalPages,
      data: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 1️⃣3️⃣ .sort():- Sort documents: 1 → ascending, -1 → descending
exports.getSortedUsers = async (req, res) => {
  try {
    // Sort by createdAt descending (newest first)
    const users = await User.find().sort({ createdAt: -1 });
    
    // Sort by age ascending
    // const users = await User.find().sort({ age: 1 });
    
    res.json({
      success: true,
      message: 'Users sorted by newest first',
      data: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 1️⃣4️⃣ .populate() → Reference Data (VERY IMPORTANT)
// Used for foreign key relationships (like SQL JOIN)
// Requires schema to have ref to another collection
exports.getUserWithPosts = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Populate posts array with actual post documents
    const user = await User.findById(id).populate('posts');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      message: 'User with posts fetched',
      data: user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===========================
// ⚡ 1️⃣5️⃣ .lean() → Performance Optimization
// ===========================
// Returns plain JavaScript objects (faster)
// Cannot use instance methods on lean documents
exports.getFastUsers = async (req, res) => {
  try {
    // Lean() makes queries faster by returning plain objects
    const users = await User.find().lean();
    
    res.json({
      success: true,
      message: 'Users fetched (fast lean mode)',
      data: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===========================
// 🎯 COMBINED EXAMPLE: Using Multiple Methods
// ===========================
// Real-world scenario: Search + Filter + Sort + Pagination + Select
exports.getFilteredAndPaginatedUsers = async (req, res) => {
  try {
    const { minAge, maxAge, page = 1, limit = 5, sortBy = 'createdAt' } = req.query;
    const skip = (page - 1) * limit;
    
    // Build filter
    let filter = {};
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }
    
    // Complex query with multiple methods
    const users = await User.find(filter)
      .select('name email age city createdAt')  // Select specific fields
      .sort({ [sortBy]: -1 })                   // Sort
      .skip(skip)                                // Pagination
      .limit(parseInt(limit))
      .lean();                                   // Performance
    
    const totalCount = await User.countDocuments(filter);
    
    res.json({
      success: true,
      filters: { minAge, maxAge },
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount: totalCount,
      data: users
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
