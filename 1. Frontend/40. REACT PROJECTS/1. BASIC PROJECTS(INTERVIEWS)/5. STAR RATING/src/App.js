// App.jsx
import React from 'react';
import StarRating from './StarRating';

const App = () => {
  const handleRating = (value) => {
    console.log("Rated:", value); // You can send this to an API
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-6">
      <h1 className="text-xl font-bold">Rate this product:</h1>
      <StarRating maxStars={5} onRate={handleRating} />
    </div>
  );
};

export default App;
