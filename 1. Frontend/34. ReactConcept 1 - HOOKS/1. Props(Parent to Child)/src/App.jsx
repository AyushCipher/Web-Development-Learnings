import React from "react";
import BlogPost from "./BlogPost";
import './App.css'

export default function App() {
  const post = {
    title: "Understanding React Props",
    content: "Props are essential in React to pass data and build dynamic UI components...",
    author: {
      name: "Daniel Patrick",
      avatar: "https://i.pravatar.cc/150?img=12",
      bio: "Frontend Developer | React Enthusiast | Tech Blogger"
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <BlogPost 
        title={post.title}
        content={post.content}
        author={post.author}
      />
    </div>
  );
}

// PROPS: Props are read-only objects that allow you to customize child components by sending them values from the parent component.

// Prop Passing from Parent to Child:

// * A unidirectional data flow in React.
// * Parent passes data or functions to its child via props.
// * Very common and natural in component-based architecture.

// USECASE:-
// * When the child only needs to read data from the parent.
// * The child doesn't change the state; it just uses it. 
