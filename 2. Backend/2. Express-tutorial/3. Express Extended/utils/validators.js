// Q. WHAT IS JOI?
// ANS: Joi is a powerful data validation library used in Node.js applications to validate incoming data before it reaches the business logic or database layer. 
// It allows developers to define validation rules (schemas) for objects, request bodies, query parameters, headers, and forms, ensuring that only valid and properly formatted data enters the application.
// Before data enters your application, Joi checks: Required fields, data types, string patterns, number ranges, Email format, Password rules, and more.


// Q. WHY USE JOI FOR VALIDATION IN A NODE.JS APPLICATION?
// ANS: Suppose a registration API expects:

// {
//   "name": "Ayush",
//   "email": "ayush@gmail.com",
//   "age": 22
// }

// But the user sends:
// {
//   "name": "",
//   "email": "abc",
//   "age": "hello"
// }

// Without validation, this data would cause errors in your application logic, Database becomes inconsistent and unexpected bugs occur.

// But with Joi, request would be rejected immediately and a clear error message would be sent back to the client:
// {
//   "success": false,
//   "message": "Invalid input data"
// }



const Joi = require("joi");

// User registration validation schema to validate incoming registration data like username, email, password, and confirmPassword
const validateRegistration = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .alphanum()
      .required()
      .messages({
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username cannot exceed 50 characters",
        "string.alphanum": "Username can only contain letters and numbers",
        "any.required": "Username is required",
      }),
    
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
    
    password: Joi.string()
      .min(8)
      .required()
      .pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/)
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base": "Password must contain uppercase, number, and special character",
        "any.required": "Password is required",
      }),
    
    confirmPassword: Joi.string()
      .valid(Joi.ref("password"))
      .required()
      .messages({
        "any.only": "Passwords do not match",
        "any.required": "Confirm password is required",
      }),
  });

  return schema.validate(data);
};



// User login validation schema to validate incoming login data like email and password
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .email()
      .required()
      .messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
    
    password: Joi.string()
      .min(8)
      .required()
      .messages({
        "string.min": "Password must be at least 8 characters",
        "any.required": "Password is required",
      }),
  });

  return schema.validate(data);
};



// User profile update validation schema to validate incoming profile update data like username, bio, and avatar URL
const validateProfileUpdate = (data) => {
  const schema = Joi.object({
    username: Joi.string()
      .min(3)
      .max(50)
      .alphanum()
      .messages({
        "string.min": "Username must be at least 3 characters",
        "string.max": "Username cannot exceed 50 characters",
      }),
    
    bio: Joi.string()
      .max(500)
      .messages({
        "string.max": "Bio cannot exceed 500 characters",
      }),
    
    avatar: Joi.string()
      .uri()
      .optional()
      .messages({
        "string.uri": "Avatar must be a valid URL",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};



// Item creation validation schema to validate incoming item creation data like title, description, category, price, and stock
const validateItemCreation = (data) => {
  const schema = Joi.object({
    title: Joi.string()
      .min(5)
      .max(100)
      .required()
      .messages({
        "string.min": "Title must be at least 5 characters",
        "string.max": "Title cannot exceed 100 characters",
        "any.required": "Title is required",
      }),
    
    description: Joi.string()
      .max(1000)
      .required()
      .messages({
        "string.max": "Description cannot exceed 1000 characters",
        "any.required": "Description is required",
      }),
    
    category: Joi.string()
      .valid("electronics", "clothing", "books", "food", "other")
      .required()
      .messages({
        "any.only": "Invalid category",
        "any.required": "Category is required",
      }),
    
    price: Joi.number()
      .positive()
      .precision(2)
      .required()
      .messages({
        "number.positive": "Price must be a positive number",
        "any.required": "Price is required",
      }),
    
    stock: Joi.number()
      .integer()
      .min(0)
      .messages({
        "number.min": "Stock cannot be negative",
      }),
  });

  return schema.validate(data, { abortEarly: false });
};



// Pagination validation schema to validate incoming pagination query parameters like page, limit, and sort
const validatePagination = (data) => {
  const schema = Joi.object({
    page: Joi.number()
      .integer()
      .min(1)
      .default(1)
      .messages({
        "number.min": "Page must be at least 1",
      }),
    
    limit: Joi.number()
      .integer()
      .min(1)
      .max(100)
      .default(10)
      .messages({
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 100",
      }),
    
    sort: Joi.string()
      .valid("newest", "oldest", "popular")
      .default("newest"),
  });

  return schema.validate(data);
};



// Search query validation schema to validate incoming search query parameters like q, category, minPrice, and maxPrice
const validateSearchQuery = (data) => {
  const schema = Joi.object({
    q: Joi.string()
      .min(2)
      .max(100)
      .optional()
      .messages({
        "string.min": "Search term must be at least 2 characters",
        "string.max": "Search term cannot exceed 100 characters",
      }),
    
    category: Joi.string()
      .optional(),
    
    minPrice: Joi.number()
      .min(0)
      .optional(),
    
    maxPrice: Joi.number()
      .min(Joi.ref("minPrice"))
      .optional()
      .messages({
        "number.min": "Max price must be greater than min price",
      }),
  });

  return schema.validate(data);
};




// Generic validation middleware generator to create reusable validation middleware for any schema
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema(req.body);
    
    if (error) {
      const details = error.details.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: details,
      });
    }
    
    // Replace req.body with validated data
    req.body = value;
    next();
  };
};



// Query parameter validation middleware generator to create reusable validation middleware for query parameters
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema(req.query);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid query parameters",
        errors: error.details[0].message,
      });
    }
    
    req.query = value;
    next();
  };
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateItemCreation,
  validatePagination,
  validateSearchQuery,
  validate,
  validateQuery,
};
