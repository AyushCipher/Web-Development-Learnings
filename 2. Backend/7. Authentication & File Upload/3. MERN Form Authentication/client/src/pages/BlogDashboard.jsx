import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import './BlogDashboard.css';

export default function BlogDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/v1/user/dashboard/stats', {
        withCredentials: true,
      });
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="blog-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p>Manage your blog content</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Students</h3>
          <p className="stat-number">{stats?.totalStudents || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Total Posts</h3>
          <p className="stat-number">{stats?.totalPosts || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Your Posts</h3>
          <p className="stat-number">{stats?.adminPosts || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Total Comments</h3>
          <p className="stat-number">{stats?.totalComments || 0}</p>
        </div>

        <div className="stat-card">
          <h3>Total Admins</h3>
          <p className="stat-number">{stats?.totalAdmins || 0}</p>
        </div>
      </div>
    </div>
  );
}
