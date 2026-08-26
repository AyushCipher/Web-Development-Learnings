import { useState } from "react";

const CitySearch = ({ onCityFetch }) => {
  const [city, setCity] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (city.trim()) onCityFetch(city.trim());
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto flex items-center gap-3 mt-10 px-4"
    >
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Search for City..."
        className="flex-grow py-3 px-5 rounded-lg bg-[#9DB2BF] text-white placeholder-white text-lg focus:outline-none focus:ring-2 focus:ring-white shadow-md"
      />
      <button
        type="submit"
        className="w-10 h-10 flex items-center justify-center bg-[#9DB2BF] text-white rounded-full hover:bg-[#6C91B1] transition-colors shadow-md"
        aria-label="Search"
      >
        🔍
      </button>
    </form>
  );
};

export default CitySearch;
