const express = require("express");
const {
  createComment,
  getComments,
  deleteComment,
} = require("../controllers/comment-controller");
const { authenticateRequest } = require("../middleware/authMiddleware");

// Q. Doesn't reading comments count as a "public" GET that shouldn't need
// auth, the way you'd expect list/read endpoints to work?
// ANS: Checked post-routes.js and the gateway before assuming that: both
// apply their auth middleware (validateToken at the gateway, then
// authenticateRequest here) to every route on the router, GET included —
// there's no unauthenticated read path for posts today. We match that real
// behaviour rather than the more RESTful-looking assumption, since
// comment-service also needs req.user.userId for the internal post-service
// call inside createComment.
module.exports = () => {
  const router = express();

  router.use(authenticateRequest);

  router.post("/:postId", createComment);
  router.get("/:postId", getComments);
  router.delete("/:commentId", deleteComment);

  return router;
};
