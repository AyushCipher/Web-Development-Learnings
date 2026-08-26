// StarRating.jsx
import React, { useState } from 'react';

const StarRating = ({ maxStars = 5, onRate }) => {
  const [rating, setRating] = useState(0);      // Current selected rating
  const [hovered, setHovered] = useState(0);     // Star currently hovered

  const handleClick = (index) => {
    setRating(index);
    if (onRate) onRate(index); // Optional callback
  };

  return (
    <div className="flex space-x-1">
      {Array.from({ length: maxStars }, (_, i) => {
        const starIndex = i + 1;
        const isFilled = hovered >= starIndex || rating >= starIndex;

        return (
          <button
            key={i}
            onClick={() => handleClick(starIndex)}
            onMouseEnter={() => setHovered(starIndex)}
            onMouseLeave={() => setHovered(0)}
            className="text-2xl focus:outline-none"
          >
            {isFilled ? '⭐' : '☆'}
          </button>
        );
      })}
    </div>
  );
};

export default StarRating;
