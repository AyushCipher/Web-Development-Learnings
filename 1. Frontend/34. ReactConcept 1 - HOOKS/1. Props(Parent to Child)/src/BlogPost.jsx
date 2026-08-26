import React from "react";
import AuthorInfo from "./AuthorInfo";

export default function BlogPost({ title, content, author }) {
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-md rounded-xl p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
      <p className="text-gray-700 text-lg">{content}</p>
      
      {/* Passing author object as props to child */}
      <AuthorInfo author={author} />
    </div>
  );
}
