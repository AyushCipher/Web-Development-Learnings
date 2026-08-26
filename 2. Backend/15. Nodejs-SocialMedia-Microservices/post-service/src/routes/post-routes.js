const express = require("express");
const {
  createPost,
  getAllPosts,
  getPost,
  deletePost,
} = require("../controllers/post-controller");
const { authenticateRequest } = require("../middleware/authMiddleware");

module.exports = (sensitiveEndpointsLimiter) => {
  const router = express();

  // middleware -> this will tell if the user is an auth user or not
  router.use(authenticateRequest);

  // Q. WHY IS sensitiveEndpointsLimiter ONLY ON create-post AND :id (DELETE),
  //    NOT ON THE GET ROUTES?
  // ANS: The limiter (defined in server.js) exists to throttle writes, which
  // are the endpoints that cost a database write and a RabbitMQ publish per
  // call and are the ones worth protecting from abuse. The GET routes are
  // read-only and already backed by the Redis cache in the controller, so
  // they're cheap enough not to need the same throttle.
  router.post("/create-post", sensitiveEndpointsLimiter, createPost);
  router.get("/all-posts", getAllPosts);
  router.get("/:id", getPost);
  router.delete("/:id", sensitiveEndpointsLimiter, deletePost);

  return router;
};
