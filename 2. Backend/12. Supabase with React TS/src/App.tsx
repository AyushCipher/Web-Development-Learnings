import { useEffect, useState } from 'react';
import { Toaster } from 'sonner';
import AuthForm from './Auth';
import TaskManager from './TaskManage';
import { supabase } from './supabase-client';
import { getErrorMessage } from './helpers';

export default function App() {
  const [userSession, setUserSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session on app load
    fetchCurrentSession();

    // Listen for auth state changes (login/logout)
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserSession(session);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);



  // Fetch the current user session
  const fetchCurrentSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      setUserSession(data.session);
    } catch (error) {
      console.error('Error fetching session:', getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };



  // Handle user logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserSession(null);
    } catch (error) {
      console.error('Error during logout:', getErrorMessage(error));
    }
  };

  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="loading">Loading...</div>;
  }



  // Show Task Manager if user is logged in, otherwise show Auth form
  return (
    <div>
      <Toaster position="top-right" richColors />
      {userSession ? (
        <>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
          <TaskManager session={userSession} />
        </>
      ) : (
        <AuthForm />
      )}
    </div>
  );
}
