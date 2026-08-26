// App.jsx
import React, { useEffect, useState } from 'react';
import UserProfile from './components/UserProfile';
import withLoader from './components/withLoader';

const UserProfileWithLoader = withLoader(UserProfile);

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setUser({ name: 'Jane Doe', email: 'jane@example.com' });
      setIsLoading(false);
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <UserProfileWithLoader isLoading={isLoading} {...user} />
    </div>
  );
};

export default App;
