const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Category = require('../models/Category');

const resolvers = {
  Query: {
    // ===== USER QUERIES =====
    
    user: async (_, { id }) => {
      try {
        return await User.findById(id)
          .populate('posts')
          .populate('followers')
          .populate('following');
      } catch (error) {
        throw new Error('User not found');
      }
    },

    userByEmail: async (_, { email }) => {
      try {
        return await User.findOne({ email })
          .populate('posts')
          .populate('followers')
          .populate('following');
      } catch (error) {
        throw new Error('User not found');
      }
    },

    users: async (_, { skip = 0, limit = 10 }) => {
      try {
        return await User.find()
          .skip(skip)
          .limit(limit)
          .populate('posts')
          .populate('followers')
          .populate('following');
      } catch (error) {
        throw new Error('Error fetching users');
      }
    },

    searchUsers: async (_, { query }) => {
      try {
        return await User.find({
          $or: [
            { name: { $regex: query, $options: 'i' } },
            { email: { $regex: query, $options: 'i' } }
          ]
        }).populate('posts');
      } catch (error) {
        throw new Error('Error searching users');
      }
    },

    followers: async (_, { userId }) => {
      try {
        const user = await User.findById(userId).populate('followers');
        return user ? user.followers : [];
      } catch (error) {
        throw new Error('Error fetching followers');
      }
    },

    following: async (_, { userId }) => {
      try {
        const user = await User.findById(userId).populate('following');
        return user ? user.following : [];
      } catch (error) {
        throw new Error('Error fetching following');
      }
    },

    // ===== POST QUERIES =====
    
    post: async (_, { id }) => {
      try {
        return await Post.findById(id)
          .populate('author')
          .populate('category')
          .populate('likes')
          .populate('comments');
      } catch (error) {
        throw new Error('Post not found');
      }
    },

    posts: async (_, { skip = 0, limit = 10, published, authorId, categoryId }) => {
      try {
        let filter = {};
        if (published !== undefined) filter.published = published;
        if (authorId) filter.author = authorId;
        if (categoryId) filter.category = categoryId;

        return await Post.find(filter)
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate('author')
          .populate('category')
          .populate('likes')
          .populate('comments');
      } catch (error) {
        throw new Error('Error fetching posts');
      }
    },

    postsByAuthor: async (_, { authorId, skip = 0, limit = 10 }) => {
      try {
        return await Post.find({ author: authorId })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate('author')
          .populate('category')
          .populate('comments');
      } catch (error) {
        throw new Error('Error fetching author posts');
      }
    },

    postsByCategory: async (_, { categoryId, skip = 0, limit = 10 }) => {
      try {
        return await Post.find({ category: categoryId })
          .skip(skip)
          .limit(limit)
          .sort({ createdAt: -1 })
          .populate('author')
          .populate('category')
          .populate('comments');
      } catch (error) {
        throw new Error('Error fetching category posts');
      }
    },

    searchPosts: async (_, { query }) => {
      try {
        return await Post.find({
          $or: [
            { title: { $regex: query, $options: 'i' } },
            { content: { $regex: query, $options: 'i' } }
          ],
          published: true
        })
          .sort({ createdAt: -1 })
          .populate('author')
          .populate('category');
      } catch (error) {
        throw new Error('Error searching posts');
      }
    },

    trendingPosts: async (_, { limit = 10 }) => {
      try {
        return await Post.find({ published: true })
          .sort({ likes: -1, views: -1 })
          .limit(limit)
          .populate('author')
          .populate('category');
      } catch (error) {
        throw new Error('Error fetching trending posts');
      }
    },

    recentPosts: async (_, { limit = 10 }) => {
      try {
        return await Post.find({ published: true })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('author')
          .populate('category')
          .populate('comments');
      } catch (error) {
        throw new Error('Error fetching recent posts');
      }
    },

    // ===== COMMENT QUERIES =====
    
    postComments: async (_, { postId }) => {
      try {
        return await Comment.find({ post: postId })
          .populate('author')
          .populate('likes')
          .populate('replies')
          .sort({ createdAt: -1 });
      } catch (error) {
        throw new Error('Error fetching comments');
      }
    },

    comment: async (_, { id }) => {
      try {
        return await Comment.findById(id)
          .populate('author')
          .populate('post')
          .populate('likes')
          .populate('replies');
      } catch (error) {
        throw new Error('Comment not found');
      }
    },

    // ===== CATEGORY QUERIES =====
    
    categories: async () => {
      try {
        return await Category.find().populate('posts');
      } catch (error) {
        throw new Error('Error fetching categories');
      }
    },

    category: async (_, { id }) => {
      try {
        return await Category.findById(id).populate('posts');
      } catch (error) {
        throw new Error('Category not found');
      }
    },

    categoryBySlug: async (_, { slug }) => {
      try {
        return await Category.findOne({ slug }).populate('posts');
      } catch (error) {
        throw new Error('Category not found');
      }
    }
  },

  Mutation: {
    // ===== USER MUTATIONS =====
    
    createUser: async (_, { input }) => {
      try {
        const user = new User(input);
        return await user.save();
      } catch (error) {
        throw new Error('Error creating user: ' + error.message);
      }
    },

    updateUser: async (_, { id, input }) => {
      try {
        return await User.findByIdAndUpdate(id, input, { new: true })
          .populate('posts')
          .populate('followers')
          .populate('following');
      } catch (error) {
        throw new Error('Error updating user');
      }
    },

    deleteUser: async (_, { id }) => {
      try {
        const user = await User.findByIdAndDelete(id);
        if (!user) throw new Error('User not found');
        
        // Delete user's posts
        await Post.deleteMany({ author: id });
        
        return true;
      } catch (error) {
        throw new Error('Error deleting user');
      }
    },

    followUser: async (_, { userId, followId }) => {
      try {
        // Add to following list
        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { following: followId } },
          { new: true }
        );
        
        // Add to followers list of the other user
        await User.findByIdAndUpdate(
          followId,
          { $addToSet: { followers: userId } },
          { new: true }
        );
        
        return await User.findById(userId)
          .populate('following')
          .populate('followers');
      } catch (error) {
        throw new Error('Error following user');
      }
    },

    unfollowUser: async (_, { userId, followId }) => {
      try {
        // Remove from following list
        await User.findByIdAndUpdate(
          userId,
          { $pull: { following: followId } },
          { new: true }
        );
        
        // Remove from followers list
        await User.findByIdAndUpdate(
          followId,
          { $pull: { followers: userId } },
          { new: true }
        );
        
        return await User.findById(userId)
          .populate('following')
          .populate('followers');
      } catch (error) {
        throw new Error('Error unfollowing user');
      }
    },

    // ===== POST MUTATIONS =====
    
    createPost: async (_, { input }) => {
      try {
        // GraphQL's CreatePostInput uses authorId/categoryId (plain ID
        // scalars, matching how every other *Id argument in this schema is
        // named), but the Mongoose Post schema's fields are actually named
        // `author`/`category` (ObjectId refs). Passing `input` straight into
        // `new Post(input)` silently leaves those two fields unset - `author`
        // is required, so that failed validation ("Path `author` is
        // required") instead of silently dropping the reference.
        const { authorId, categoryId, ...rest } = input;
        const post = new Post({
          ...rest,
          author: authorId,
          category: categoryId,
        });
        await post.save();

        // Add post to user's posts array
        await User.findByIdAndUpdate(
          authorId,
          { $push: { posts: post._id } },
          { new: true }
        );

        if (categoryId) {
          await Category.findByIdAndUpdate(
            categoryId,
            { $push: { posts: post._id } },
            { new: true }
          );
        }

        return await Post.findById(post._id)
          .populate('author')
          .populate('category');
      } catch (error) {
        throw new Error('Error creating post: ' + error.message);
      }
    },

    updatePost: async (_, { id, input }) => {
      try {
        // Same authorId/categoryId -> author/category field-name mismatch
        // as createPost above; UpdatePostInput only ever carries categoryId,
        // not authorId (a post's author can't be reassigned via this schema).
        const { categoryId, ...rest } = input;
        const update = categoryId !== undefined ? { ...rest, category: categoryId } : rest;

        return await Post.findByIdAndUpdate(id, update, { new: true })
          .populate('author')
          .populate('category')
          .populate('comments');
      } catch (error) {
        throw new Error('Error updating post');
      }
    },

    deletePost: async (_, { id }) => {
      try {
        const post = await Post.findByIdAndDelete(id);
        if (!post) throw new Error('Post not found');
        
        // Remove from author's posts
        await User.findByIdAndUpdate(
          post.author,
          { $pull: { posts: id } }
        );
        
        // Delete all comments
        await Comment.deleteMany({ post: id });
        
        return true;
      } catch (error) {
        throw new Error('Error deleting post');
      }
    },

    publishPost: async (_, { id }) => {
      try {
        return await Post.findByIdAndUpdate(
          id,
          { published: true },
          { new: true }
        ).populate('author')
          .populate('category')
          .populate('comments');
      } catch (error) {
        throw new Error('Error publishing post');
      }
    },

    unpublishPost: async (_, { id }) => {
      try {
        return await Post.findByIdAndUpdate(
          id,
          { published: false },
          { new: true }
        ).populate('author')
          .populate('category');
      } catch (error) {
        throw new Error('Error unpublishing post');
      }
    },

    likePost: async (_, { postId, userId }) => {
      try {
        return await Post.findByIdAndUpdate(
          postId,
          { $addToSet: { likes: userId } },
          { new: true }
        ).populate('author')
          .populate('likes')
          .populate('comments');
      } catch (error) {
        throw new Error('Error liking post');
      }
    },

    unlikePost: async (_, { postId, userId }) => {
      try {
        return await Post.findByIdAndUpdate(
          postId,
          { $pull: { likes: userId } },
          { new: true }
        ).populate('author')
          .populate('likes')
          .populate('comments');
      } catch (error) {
        throw new Error('Error unliking post');
      }
    },

    incrementPostViews: async (_, { postId }) => {
      try {
        return await Post.findByIdAndUpdate(
          postId,
          { $inc: { views: 1 } },
          { new: true }
        ).populate('author')
          .populate('category');
      } catch (error) {
        throw new Error('Error incrementing views');
      }
    },

    // ===== COMMENT MUTATIONS =====
    
    createComment: async (_, { input }) => {
      try {
        // Same authorId/postId -> author/post field-name mismatch as
        // createPost above - see that comment for why the plain `new
        // Comment(input)` doesn't work.
        const comment = new Comment({
          text: input.text,
          author: input.authorId,
          post: input.postId,
        });
        await comment.save();

        // Add comment to post
        await Post.findByIdAndUpdate(
          input.postId,
          { $push: { comments: comment._id } },
          { new: true }
        );
        
        return await Comment.findById(comment._id)
          .populate('author')
          .populate('post');
      } catch (error) {
        throw new Error('Error creating comment: ' + error.message);
      }
    },

    updateComment: async (_, { id, text }) => {
      try {
        return await Comment.findByIdAndUpdate(
          id,
          { text },
          { new: true }
        ).populate('author')
          .populate('post');
      } catch (error) {
        throw new Error('Error updating comment');
      }
    },

    deleteComment: async (_, { id }) => {
      try {
        const comment = await Comment.findByIdAndDelete(id);
        if (!comment) throw new Error('Comment not found');
        
        // Remove from post
        await Post.findByIdAndUpdate(
          comment.post,
          { $pull: { comments: id } }
        );
        
        return true;
      } catch (error) {
        throw new Error('Error deleting comment');
      }
    },

    likeComment: async (_, { commentId, userId }) => {
      try {
        return await Comment.findByIdAndUpdate(
          commentId,
          { $addToSet: { likes: userId } },
          { new: true }
        ).populate('author')
          .populate('likes');
      } catch (error) {
        throw new Error('Error liking comment');
      }
    },

    unlikeComment: async (_, { commentId, userId }) => {
      try {
        return await Comment.findByIdAndUpdate(
          commentId,
          { $pull: { likes: userId } },
          { new: true }
        ).populate('author')
          .populate('likes');
      } catch (error) {
        throw new Error('Error unliking comment');
      }
    },

    replyComment: async (_, { input }) => {
      try {
        const reply = new Comment({
          text: input.text,
          author: input.authorId,
          post: input.postId
        });
        await reply.save();
        
        // Add reply to parent comment
        await Comment.findByIdAndUpdate(
          input.parentCommentId,
          { $push: { replies: reply._id } },
          { new: true }
        );
        
        return await Comment.findById(reply._id)
          .populate('author')
          .populate('post');
      } catch (error) {
        throw new Error('Error replying to comment: ' + error.message);
      }
    },

    // ===== CATEGORY MUTATIONS =====
    
    createCategory: async (_, { input }) => {
      try {
        const category = new Category(input);
        return await category.save();
      } catch (error) {
        throw new Error('Error creating category: ' + error.message);
      }
    },

    updateCategory: async (_, { id, input }) => {
      try {
        return await Category.findByIdAndUpdate(id, input, { new: true })
          .populate('posts');
      } catch (error) {
        throw new Error('Error updating category');
      }
    },

    deleteCategory: async (_, { id }) => {
      try {
        const category = await Category.findByIdAndDelete(id);
        if (!category) throw new Error('Category not found');
        
        // Remove category from posts
        await Post.updateMany(
          { category: id },
          { category: null }
        );
        
        return true;
      } catch (error) {
        throw new Error('Error deleting category');
      }
    }
  },

  // ===== FIELD RESOLVERS =====
  
  User: {
    postsCount: (user) => user.posts?.length || 0,
    followersCount: (user) => user.followers?.length || 0,
    followingCount: (user) => user.following?.length || 0
  },

  Post: {
    likesCount: (post) => post.likes?.length || 0,
    commentsCount: (post) => post.comments?.length || 0
  },

  Comment: {
    likesCount: (comment) => comment.likes?.length || 0,
    repliesCount: (comment) => comment.replies?.length || 0
  },

  Category: {
    postsCount: (category) => category.posts?.length || 0
  }
};

module.exports = resolvers;
