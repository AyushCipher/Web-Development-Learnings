import React, { useState } from 'react';
import { supabase } from './supabase-client';
import { getErrorMessage, isValidEmail, isValidPassword } from './helpers';

export default function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Toggle between sign in and sign up
  const toggleAuthMode = () => {
    setIsSignIn(!isSignIn);
    setEmail('');
    setPassword('');
    setError('');
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }
    if (!isValidEmail(email)) {
      setError('Please enter a valid email');
      return false;
    }
    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  
  // Handle sign in or sign up
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    try {
      setLoading(true);

      if (isSignIn) {
        // Sign in with email and password
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        // Sign up new user
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError('Sign up successful! Please check your email to verify your account.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <h1 className="auth-title">{isSignIn ? 'Sign In' : 'Sign Up'}</h1>

      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter your email"
          className="auth-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="Enter your password"
          className="auth-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Submit Button */}
        <button type="submit" className="auth-button" disabled={loading}>
          {loading ? 'Loading...' : isSignIn ? 'Sign In' : 'Sign Up'}
        </button>
      </form>

      {/* Toggle between Sign In and Sign Up */}
      <p className="auth-toggle">
        {isSignIn ? "Don't have an account? " : 'Already have an account? '}
        <span className="auth-link" onClick={toggleAuthMode} style={{ cursor: 'pointer' }}>
          {isSignIn ? 'Sign Up' : 'Sign In'}
        </span>
      </p>
    </div>
  );
}
