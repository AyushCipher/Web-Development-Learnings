import { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './CreateBlog.css';

export default function CreateBlog() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          image: reader.result,
        }));
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim() || !formData.image) {
      toast.error('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/v1/posts', formData, {
        withCredentials: true,
      });

      if (response.data.success) {
        toast.success('Blog post created successfully!');
        setFormData({ title: '', description: '', image: '' });
        setPreview(null);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-blog">
      <div className="create-blog-card">
        <h2>Create New Blog Post</h2>
        <p className="subtitle">Share your knowledge with students</p>

        <form onSubmit={handleSubmit} className="blog-form">
          {/* Image Upload */}
          <div className="form-group">
            <label htmlFor="image">
              {preview ? (
                <div className="image-preview-wrapper">
                  <img src={preview} alt="Preview" className="image-preview" />
                  <span className="change-image">Change Image</span>
                </div>
              ) : (
                <div className="image-placeholder">
                  <div className="upload-icon">📸</div>
                  <p>Click to upload image</p>
                </div>
              )}
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                hidden
                required
              />
            </label>
          </div>

          {/* Title */}
          <div className="form-group">
            <label htmlFor="title">Blog Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter blog title"
              maxLength={200}
              required
            />
            <small>{formData.title.length}/200</small>
          </div>

          {/* Description */}
          <div className="form-group">
            <label htmlFor="description">Blog Content</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Write your blog content here..."
              rows={8}
              maxLength={5000}
              required
            />
            <small>{formData.description.length}/5000</small>
          </div>

          {/* Submit Button */}
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Publishing...' : 'Publish Blog'}
          </button>
        </form>
      </div>
    </div>
  );
}
