import React from "react";

const TabSwitcher = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex justify-center space-x-4">
      <button
        className={`px-4 py-2 mr-4 rounded ${
          activeTab === "your" ? "bg-white text-black" : "text-white"
        }`}
        onClick={() => setActiveTab("your")}
      >
        Your Weather
      </button>
      <button
        className={`px-4 py-2 ml-4 rounded ${
          activeTab === "search" ? "bg-white text-black" : "text-white"
        }`}
        onClick={() => setActiveTab("search")}
      >
        Search Weather
      </button>
    </div>
  );
};

export default TabSwitcher;
