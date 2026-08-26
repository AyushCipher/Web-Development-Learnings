import React from "react";
import locationIcon from "../assets/location.png"; // Use your own image path

const GeoWeather = ({ onGrant }) => {
  const handleGrantAccess = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onGrant(); // Notify App to proceed
      },
      (error) => {
        alert("Location access denied.");
        console.error("Geolocation error:", error);
      }
    );
  };

  return (
    <div className="flex flex-col items-center mt-10">
      <img src={locationIcon} alt="Location Icon" className="w-24 h-24" />
      <h2 className="mt-4 text-xl font-bold">Grant Location Access</h2>
      <p className="text-sm text-center mt-2">Allow Access to get weather Information</p>
      <button
        onClick={handleGrantAccess}
        className="mt-4 px-6 py-2 bg-blue-500 rounded hover:bg-blue-600"
      >
        GRANT ACCESS
      </button>
    </div>
  );
};

export default GeoWeather;
