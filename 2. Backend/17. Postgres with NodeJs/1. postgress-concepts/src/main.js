// Q. WHAT IS POSTGRESQL?
// ANS: PostgreSQL is a powerful, open-source Relational Database Management System (RDBMS) used to store, manage, and retrieve structured data efficiently. 
// It follows the relational database model, where data is organized into tables consisting of rows and columns, and supports advanced features such as transactions, indexing, views, triggers, stored procedures, JSON data storage, and ACID compliance. 
// PostgreSQL is widely used in modern web applications, enterprise systems, financial platforms, analytics systems, and cloud-based applications because of its reliability, performance, and rich feature set.


// Q. WHY USE POSTGRESQL WITH?
// ANS: PostgreSQL is used because it provides a secure, reliable, and scalable way to store and manage application data. 
// It supports complex queries, relationships between tables, transactions, concurrency control, and data integrity through ACID properties. 
// Developers use PostgreSQL in applications such as e-commerce platforms, banking systems, ERP software, social media applications, and SaaS products where data consistency and reliability are critical. 
// Its support for both traditional SQL data and modern JSON data makes it flexible enough for a wide variety of use cases.


// Q. HOW TO CONNECT POSTGRESQL WITH NODE.JS?
// ANS: To connect PostgreSQL with Node.js, you can use the 'pg' library, which is a popular PostgreSQL client for Node.js.


// Q. HOW DOES POSTGRESQL WORK? 
// ANS: PostgreSQL works by storing data in tables within a database and allowing applications to interact with that data using SQL queries. 
// When a user or application sends a query such as SELECT, INSERT, UPDATE, or DELETE, PostgreSQL parses the query, creates an execution plan, retrieves or modifies the required data, and returns the result. 
// Internally, it manages indexes, transactions, locks, caching, and storage mechanisms to ensure efficient and consistent access to data, even when thousands of users are accessing the database simultaneously.


// Q. HOW IS POSTGRESQL DIFFERENT FROM SQL?
// ANS: PostgreSQL works by storing data in tables within a database and allowing applications to interact with that data using SQL queries. 
// When a user or application sends a query such as SELECT, INSERT, UPDATE, or DELETE, PostgreSQL parses the query, creates an execution plan, retrieves or modifies the required data, and returns the result. 
// Internally, it manages indexes, transactions, locks, caching, and storage mechanisms to ensure efficient and consistent access to data, even when thousands of users are accessing the database simultaneously.


// Q. WHY POSTGRESQL IS BETTER THAN OTHER RELATIONAL DATABASES?
// ANS: PostgreSQL is often preferred over other relational databases because it offers advanced features such as better standards compliance, powerful indexing options, JSON and JSONB support, full-text search, 
// extensibility, stronger concurrency handling, and excellent support for complex queries. 
// These capabilities make PostgreSQL a popular choice for modern applications that require both high performance and advanced database functionality.


// Q. IS POSTGRESQL BETTER THAN MONGODB?
// ANS: PostgreSQL is not universally better than MongoDB. PostgreSQL is preferred when applications require strong ACID transactions, complex relationships, joins, and strict data consistency, 
// such as banking, payment, and ERP systems. MongoDB is preferred when applications require flexible schemas, rapid development, handling of semi-structured data, and easy horizontal scaling, 
// such as social media, chat, and content-driven applications. 
// The choice depends on the application's requirements rather than one database being inherently better than the other.



const {
  countPostsByUser,
  getAveragePostsPerUser,
} = require("./concepts/aggregation");
const {
  insertUser,
  createUsersTable,
  fetchAllUsers,
  updateUserByUsername,
  deleteUserByUsername,
} = require("./concepts/basic-queries");
const {
  getUsersStartingWith,
  getSortedUsers,
  getPaginatedUsers,
} = require("./concepts/filtering-sorting");
const {
  getUsersWithPosts,
  getAllUsersAndTheirPosts,
} = require("./concepts/joins");
const { createPostsTable, insertNewPost } = require("./concepts/relationships");

// test basic queries
async function testBasicQueries() {
  try {
    await createUsersTable();
    // Insert new users
    await insertUser("Ayush Verma", "ayush854@gmail.com");
    await insertUser("John Doe", "john231@gmail.com");
    await insertUser("Travis Head", "travis123@gmail.com");
    await insertUser("Jennifer Lopez", "jennifer678@gmail.com");
    await insertUser("Zayn Malik", "zaynmalik789@gmail.com");
    console.log("All users");
    const allUsers = await fetchAllUsers();
    console.log(allUsers);
    const updatedUser = await updateUserByUsername(
      "Ayush Verma",
      "raja@gmail.com"
    );
    console.log(updatedUser);

    const deletedUser = await deleteUserByUsername("Ayush Verma");
    console.log(deletedUser);
  } catch (e) {
    console.error("Error", e);
  }
}

// test filtering and sorting queries
async function testFilterAndSortQueries() {
  try {
    // get users with a username whose username starting with z
    const zFilteredUsers = await getUsersStartingWith("Z");
    console.log(zFilteredUsers);

    const sortedUsers = await getSortedUsers("created_at", "ASC");
    console.log(sortedUsers);

    const paginatedUsers = await getPaginatedUsers(2, 1);
    console.log("paginatedUsers", paginatedUsers);
  } catch (e) {
    console.error("Error", e);
  }
}

// test relationship queries
async function testRelationshipQueries() {
  try {
    await createPostsTable();

    await insertNewPost("Second post", "This is my second post", 3);
    await insertNewPost("Third post", "This is my third post", 4);
    await insertNewPost("Fourth post", "This is my fourth post", 3);
  } catch (e) {
    console.error("Error", e);
  }
}


// test join queries
async function testJoinQueries() {
  try {
    const usersWithPosts = await getUsersWithPosts();
    console.log(usersWithPosts);

    const allUsersWithAllPosts = await getAllUsersAndTheirPosts();
    console.log(allUsersWithAllPosts);
  } catch (e) {
    console.error("Error", e);
  }
}

// test aggregate queries
async function testAggregateQuerise() {
  try {
    const postCount = await countPostsByUser();
    console.log(postCount);

    const averagePostsPerUserInfo = await getAveragePostsPerUser();
    console.log(averagePostsPerUserInfo);
  } catch (e) {
    console.error(e);
  }
}

// test all queries
async function testAllQueries() {
  await testBasicQueries();
  await testFilterAndSortQueries();
  await testRelationshipQueries();

  await testJoinQueries();
  await testAggregateQuerise();
}

testAllQueries();
