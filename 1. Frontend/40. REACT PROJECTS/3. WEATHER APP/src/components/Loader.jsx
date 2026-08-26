import React from "react";

const Loader = () => {
  return (
    <div className="text-center mt-10">
      <div className="loader mx-auto border-4 border-t-4 border-white rounded-full w-12 h-12 animate-spin"></div>
      <p className="mt-4">Loading...</p>
    </div>
  );
};

export default Loader;
