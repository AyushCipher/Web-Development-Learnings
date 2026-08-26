import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ProtectedRoute({ children, requiredRole }) {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/v1/user/me', {
        withCredentials: true,
      });

      if (response.data.success) {
        const user = response.data.user;
        if (requiredRole && user.role !== requiredRole) {
          toast.error('You do not have permission to access this page');
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      }
    } catch (error) {
      toast.error('Please login to continue');
      setIsAuthorized(false);
    }
  };

  if (isAuthorized === null) {
    return <div className="loading">Loading...</div>;
  }

  return isAuthorized ? children : <Navigate to="/auth" />;
}
