import React from "react";

export default function AuthorInfo({ author }) {
  return (
    <div className="flex items-center space-x-4 border-t pt-4 mt-6">
      <img 
        src={author.avatar} 
        alt={author.name} 
        className="w-14 h-14 rounded-full object-cover"
      />
      <div>
        <h3 className="text-md font-semibold text-blue-600">{author.name}</h3>
        <p className="text-gray-500 text-sm">{author.bio}</p>
      </div>
    </div>
  );
}
