// withLoader.js
import React from 'react';

const withLoader = (WrappedComponent) => {
  return function EnhancedComponent({ isLoading, ...props }) {
    if (isLoading) {
      return (
        <div className="text-center p-6">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default withLoader;
