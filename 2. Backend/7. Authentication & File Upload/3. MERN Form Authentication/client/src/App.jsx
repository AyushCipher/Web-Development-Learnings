import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

import Home from './pages/Home';
import Auth from './pages/Auth';
import OtpVerification from './pages/OtpVerification';
import ForgotPassword from './pages/ForgotPassword';
import BlogFeed from './pages/BlogFeed';
import BlogDashboard from './pages/BlogDashboard';
import CreateBlog from './pages/CreateBlog';
import Navigation from './components/Navigation';
import ProtectedRoute from './components/ProtectedRoute';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Router>
        <Navigation />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/otp-verification/:email/:phone" element={<OtpVerification />} />
          <Route path="/password/forgot" element={<ForgotPassword />} />
          <Route path="/password/reset/:token" element={<ForgotPassword />} />
          <Route path="/blog" element={<BlogFeed />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><BlogDashboard /></ProtectedRoute>} />
          <Route path="/admin/create-blog" element={<ProtectedRoute requiredRole="admin"><CreateBlog /></ProtectedRoute>} />
        </Routes>
        <ToastContainer theme="colored" />
      </Router>
    </>
  );
}

export default App;
