import React from "react";

function Dashboard() {
  const username = localStorage.getItem("username");

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100">
      <h1 className="text-4xl font-bold text-gray-800">
        Welcome "{username}"
      </h1>
    </div>
  );
}

export default Dashboard;
