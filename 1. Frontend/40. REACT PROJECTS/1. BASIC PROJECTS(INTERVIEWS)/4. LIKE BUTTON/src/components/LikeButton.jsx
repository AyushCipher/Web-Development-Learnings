// LikeButton.jsx
import React, { useState } from 'react';

const LikeButton = ({ initialCount = 0 }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);

  const handleLikeToggle = () => {
    setLiked(prev => !prev);
    setCount(prev => (liked ? prev - 1 : prev + 1));
  };

  return (
    <button
      onClick={handleLikeToggle}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-colors duration-200 ${
        liked ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-700'
      }`}
    >
      <span className="text-xl">{liked ? '❤️' : '🤍'}</span>
      <span className="font-medium">{count}</span>
    </button>
  );
};

export default LikeButton;
