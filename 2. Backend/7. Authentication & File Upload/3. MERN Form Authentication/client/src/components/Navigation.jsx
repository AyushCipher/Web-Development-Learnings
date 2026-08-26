import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Context } from '../main';
import './Navigation.css';

export default function Navigation() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated } = useContext(Context);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUser();
  }, [isAuthenticated]); // Refetch when authentication status changes

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/v1/user/me', {
        withCredentials: true,
      });
      if (response.data.success) {
        console.log('✅ User fetched:', response.data.user);
        setUser(response.data.user);
      }
    } catch (error) {
      console.log('User not authenticated');
      setUser(null);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.get('/api/v1/user/logout', {
        withCredentials: true,
      });
      toast.success('Logged out');
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          📝 BlogHub
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li>
            <Link to="/blog" onClick={() => setMenuOpen(false)}>
              Blog Feed
            </Link>
          </li>

          {user ? (
            <>
              {user.role === 'admin' && (
                <>
                  <li>
                    <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/create-blog" onClick={() => setMenuOpen(false)}>
                      Create Blog
                    </Link>
                  </li>
                </>
              )}

              <li className="user-item">
                <span>{user.name}</span>
                <span className="role-badge">{user.role}</span>
              </li>

              <li>
                <button className="logout-btn" onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/auth" className="auth-link" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </nav>
  );
}
