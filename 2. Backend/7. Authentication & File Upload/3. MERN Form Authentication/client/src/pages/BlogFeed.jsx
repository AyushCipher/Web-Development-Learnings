import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './BlogFeed.css';

export default function BlogFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/v1/posts?page=${page}&limit=5`, {
        withCredentials: true,
      });

      if (response.data.success) {
        if (page === 1) {
          setPosts(response.data.posts);
        } else {
          setPosts((prev) => [...prev, ...response.data.posts]);
        }
        setHasMore(response.data.pagination.currentPage < response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await axios.post(`/api/v1/posts/${postId}/like`, {}, {
        withCredentials: true,
      });

      if (response.data.success) {
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? response.data.post : post
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to like post');
    }
  };

  if (loading && page === 1) {
    return <div className="loading">Loading blog posts...</div>;
  }

  return (
    <div className="blog-feed">
      <div className="feed-header">
        <h1>Blog Feed</h1>
        <p>Read and comment on blog posts</p>
      </div>

      <div className="posts-container">
        {posts.length > 0 ? (
          posts.map((post) => (
            <BlogCard
              key={post._id}
              post={post}
              onLike={handleLikePost}
              onCommentAdded={() => fetchPosts()}
            />
          ))
        ) : (
          <div className="empty-state">
            <p>No blog posts yet. Check back soon!</p>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button onClick={handleLoadMore} className="load-more-btn" disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}

function BlogCard({ post, onLike, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments();
    }
  }, [showComments]);

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await axios.get(`/api/v1/comments/${post._id}?limit=10`, {
        withCredentials: true,
      });

      if (response.data.success) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmittingComment(true);
    try {
      const response = await axios.post(
        `/api/v1/comments/${post._id}`,
        { text: newComment },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Comment added!');
        setComments((prev) => [response.data.comment, ...prev]);
        setNewComment('');
        onCommentAdded();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      const response = await axios.delete(`/api/v1/comments/${commentId}`, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success('Comment deleted');
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      const response = await axios.post(`/api/v1/comments/${commentId}/like`, {}, {
        withCredentials: true,
      });

      if (response.data.success) {
        setComments((prev) =>
          prev.map((c) => (c._id === commentId ? response.data.comment : c))
        );
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to like comment');
    }
  };

  return (
    <div className="blog-card">
      <div className="blog-header">
        <div className="author-info">
          <div className="avatar">{post.adminName?.[0]?.toUpperCase()}</div>
          <div>
            <h4>{post.adminName || 'Admin'}</h4>
            <p>{new Date(post.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <div className="blog-content">
        <h2>{post.title}</h2>
        <img src={post.image} alt={post.title} className="blog-image" />
        <p className="blog-description">{post.description}</p>
      </div>

      <div className="blog-actions">
        <button
          className="action-btn"
          onClick={() => onLike(post._id)}
        >
          👍 {post.likesCount} Likes
        </button>
        <button
          className="action-btn"
          onClick={() => setShowComments(!showComments)}
        >
          💬 {post.commentsCount} Comments
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleSubmitComment} className="comment-form">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              maxLength={1000}
            />
            <button type="submit" disabled={submittingComment}>
              {submittingComment ? '...' : 'Post'}
            </button>
          </form>

          <div className="comments-list">
            {loadingComments ? (
              <p className="loading-text">Loading comments...</p>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment._id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-avatar">{comment.authorName?.[0]?.toUpperCase()}</div>
                    <div className="comment-info">
                      <h5>
                        {comment.authorName}
                        {comment.authorRole === 'admin' && <span className="admin-badge">Admin</span>}
                      </h5>
                      <p>{new Date(comment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  <div className="comment-actions">
                    <button
                      className="comment-action-btn"
                      onClick={() => handleLikeComment(comment._id)}
                    >
                      👍 {comment.likesCount}
                    </button>
                    <button
                      className="comment-action-btn delete-btn"
                      onClick={() => handleDeleteComment(comment._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-comments">No comments yet. Be first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
