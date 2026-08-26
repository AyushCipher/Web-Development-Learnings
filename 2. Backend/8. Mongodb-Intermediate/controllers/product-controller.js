const Product = require("../models/Product");


// 1. AGGREGATION PIPELINE - Advanced data processing pipeline used for Analytics, Reports, Calculations (avg, sum, count)
const getProductStats = async (req, res) => {
  try {
    const result = await Product.aggregate([
      // Stage 1: Filter documents
      {
        $match: {
          inStock: true,
          price: {
            $gte: 100,
          },
        },
      },

      // Stage 2: Group documents
      {
        $group: {
          _id: "$category",
          avgPrice: {
            $avg: "$price",
          },
          count: {
            $sum: 1,
          },
          totalRevenue: {
            $sum: "$price",
          },
        },
      },

      // Stage 3: Sort by average price
      {
        $sort: { avgPrice: -1 },
      },
    ]);

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error fetching product stats!",
    });
  }
};

// Complex aggregation with multiple stages
const getProductAnalysis = async (req, res) => {
  try {
    const result = await Product.aggregate([
      {
        $match: {
          category: "Electronics",
        },
      },
      {
        $group: {
          _id: null,        // Group ALL products together into ONE group
          totalRevenue: {
            $sum: "$price",
          },
          averagePrice: {
            $avg: "$price",
          },
          maxProductPrice: {
            $max: "$price",
          },
          minProductPrice: {
            $min: "$price",
          },
          productCount: {
            $sum: 1,
          },
        },
      },
      {
        $project: {       // FORMAT output: Decide what to show and how to show it
          _id: 0,
          totalRevenue: 1,
          averagePrice: { $round: ["$averagePrice", 2] },
          maxProductPrice: 1,
          minProductPrice: 1,
          priceRange: {
            $subtract: ["$maxProductPrice", "$minProductPrice"],
          },
          productCount: 1,
        },
      },
    ]);
//          EXAMPLE:
//     {
//      totalRevenue: 2300,
//      averagePrice: 766.67,
//      maxProductPrice: 1000,
//      minProductPrice: 500,
//      priceRange: 500,
//      productCount: 3
//     }

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching product analysis!",
    });
  }
};



// 2. PAGINATION & SORTING - Essential for APIs
const getProductsWithPagination = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;     // From URL: /products?page=2&limit=5  ;  page = 2, limit = 5
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;                // If user doesn’t send anything 

    // Fetch products with pagination
    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination metadata
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching products!",
    });
  }
};



// 3. TEXT SEARCH - Full-text search capability
const searchProducts = async (req, res) => {
  try {
    const query = req.query.q;            // From URL: /products/search?q=iphone

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required!",
      });
    }

    // Text search using indexes
    const results = await Product.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } } // relevance score ranking (Highest score = most relevant result)
    ).sort({ score: { $meta: "textScore" } });

    res.status(200).json({
      success: true,
      data: results,
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error during search!",
    });
  }
};



// 4. FILTERING & QUERYING - Query Operators
const getFilteredProducts = async (req, res) => {
  try {
    // EXAMPLE: /products?minPrice=1000&maxPrice=5000&category=Electronics&rating=4&inStock=true
    const { minPrice, maxPrice, category, rating, inStock } = req.query;

    const filter = {};

    // Price range filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Rating filter
    if (rating) {
      filter.rating = { $gte: Number(rating) };
    }

    // Stock filter: Convert string → boolean
    if (inStock) {
      filter.inStock = inStock === "true";
    }

    const products = await Product.find(filter)
      .sort({ rating: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error filtering products!",
    });
  }
};



// 5. LEAN QUERIES - Performance Optimization
const getFastProducts = async (req, res) => {
  try {
    // .lean() returns plain JavaScript objects instead of Mongoose documents
    // This is much faster when you only need to read data
    const products = await Product.find({ inStock: true })
      .lean()
      .limit(20);

    res.status(200).json({
      success: true,
      data: products,
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching products!",
    });
  }
};



// 6. PROJECTION - Select specific fields / required fields only
const getProductNameAndPrice = async (req, res) => {
  try {
    // Only fetch name, price, and category fields (exclude others).
    // Mongoose queries have no .exclude() method (that would throw
    // "products.exclude is not a function" at request time) - a leading
    // "-" inside .select() is how you exclude a field instead. _id is
    // included by default even when you list other fields to include, so
    // it needs its own "-_id" to actually be left out.
    const products = await Product.find()
      .select("name price category rating -_id");

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching products!",
    });
  }
};



// 7. BULK OPERATIONS - Insert/Update Many Products at once
const insertSampleProducts = async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: "Laptop",
        category: "Electronics",
        price: 999,
        inStock: true,
        quantity: 50,
        tags: ["computer", "tech"],
        description: "High-performance laptop for gaming and work",
      },
      {
        name: "Smartphone",
        category: "Electronics",
        price: 699,
        inStock: true,
        quantity: 100,
        tags: ["mobile", "tech"],
        description: "Latest smartphone with advanced features",
      },
      {
        name: "Headphones",
        category: "Electronics",
        price: 199,
        inStock: false,
        quantity: 0,
        tags: ["audio", "tech"],
        description: "Premium wireless headphones",
      },
      {
        name: "Running Shoes",
        category: "Sports",
        price: 89,
        inStock: true,
        quantity: 200,
        tags: ["footwear", "running"],
        description: "Comfortable running shoes",
      },
      {
        name: "Novel",
        category: "Books",
        price: 15,
        inStock: true,
        quantity: 500,
        tags: ["fiction", "bestseller"],
        description: "Bestselling fiction novel",
      },
    ];

    const result = await Product.insertMany(sampleProducts);

    res.status(201).json({
      success: true,
      message: `Inserted ${result.length} sample products`,
      data: result,
    });

  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Error inserting products!",
    });
  }
};



// 8. BULK WRITE OPERATIONS - Advanced bulk ops (Perform multiple different operations in ONE request)
const bulkUpdateProducts = async (req, res) => {
  try {
    const bulkOps = [
      {
        updateOne: {
          filter: { category: "Electronics" },
          update: { $mul: { price: 1.1 } }, // Increase electronics price by 10%
        },
      },
      {
        updateMany: {
          filter: { quantity: { $lt: 10 } },
          update: { $set: { inStock: false } }, // Mark low stock items as out of stock
        },
      },
      {
        deleteMany: {
          filter: { rating: { $lt: 1 } }, // Delete products with very low rating
        },
      },
    ];

    const result = await Product.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Bulk operations completed",
      data: {
        modifiedCount: result.modifiedCount,
        deletedCount: result.deletedCount,
        insertedCount: result.insertedCount,
      },
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error in bulk operations!",
    });
  }
};



// 9. UPSERT - Update if exists, otherwise insert 
const upsertProduct = async (req, res) => {
  try {
    const { name, category, price } = req.body;

    // If product with this name exists, update it. Otherwise, create new one.
    const result = await Product.findOneAndUpdate(
      { name: name },
      { $set: { category, price, updatedAt: new Date() } },
      { upsert: true, new: true, runValidators: true } 
      // upsert: true means insert if not found, 
      // new: true: return the updated/new document, 
      // runValidators: true ensures validation rules are applied
    );

    res.status(200).json({
      success: true,
      message: result._id ? "Product updated" : "Product created",
      data: result,
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error in upsert operation!",
    });
  }
};



// 10. CONDITIONAL UPDATES - Update specific fields
const updateProductStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found!",
      });
    }

    // Use custom method from model/schema
    if (quantity > 0) {
      await product.increaseStock(quantity);
    } else {
      await product.decreaseStock(Math.abs(quantity));
    }

    // 🔥 Manual logic if method was not defined in schema(instead of methods)
    // if (quantity > 0) {
    //   product.quantity += quantity;
    // } else {
    //   product.quantity -= Math.abs(quantity);
    // }

    // // Optional safety check
    // if (product.quantity < 0) {
    //   product.quantity = 0;
    // }

    // await product.save();

    res.status(200).json({
      success: true,
      message: "Stock updated",
      data: product,
    });

  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error updating stock!",
    });
  }
};



// 11. QUERY EXPLANATION - Index & Performance Analysis
const explainQuery = async (req, res) => {
  try {
    // explain() shows how MongoDB executes the query
    const explanation = await Product.find({ category: "Electronics" }).explain("executionStats");

    res.status(200).json({
      success: true,
      message: "Query execution stats",
      data: {
        executionStages: explanation.executionStats.executionStages,
        nDocsScanned: explanation.executionStats.totalDocsExamined,                   // How many documents MongoDB checked
        nDocsReturned: explanation.executionStats.nReturned,                          // How many documents matched the query   
        isIndexUsed: explanation.executionStats.executionStages.stage !== "COLLSCAN", // Whether an index was used ( If: COLLSCAN → full scan❌ , IXSCAN → index used ✅)
      },
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error explaining query!",
    });
  }
};



// 12. DISTINCT VALUES - Get unique values
const getDistinctCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");  // Get unique values of category field

    // Q. Why not use find?
    // Ans - Gives duplicates ❌

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching categories!",
    });
  }
};



// 13. STATIC METHODS - Using model static methods
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.findByCategory(category);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching products!",
    });
  }
};

const getExpensiveProducts = async (req, res) => {
  try {
    const minPrice = req.query.minPrice || 500;
    const products = await Product.findExpensive(minPrice);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching expensive products!",
    });
  }
};

const getInStockProducts = async (req, res) => {
  try {
    const products = await Product.findInStock().lean();

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error fetching in-stock products!",
    });
  }
};

module.exports = {
  insertSampleProducts,
  getProductStats,
  getProductAnalysis,
  getProductsWithPagination,
  searchProducts,
  getFilteredProducts,
  getFastProducts,
  getProductNameAndPrice,
  bulkUpdateProducts,
  upsertProduct,
  updateProductStock,
  explainQuery,
  getDistinctCategories,
  getProductsByCategory,
  getExpensiveProducts,
  getInStockProducts,
};
