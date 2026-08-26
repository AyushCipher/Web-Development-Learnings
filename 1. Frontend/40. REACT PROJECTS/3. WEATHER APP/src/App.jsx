import React, { useState, useEffect } from "react";
import TabSwitcher from "./components/TabSwitcher";
import GeoWeather from "./components/GeoWeather";
import WeatherDisplay from "./components/WeatherDisplay";
import Loader from "./components/Loader";
import CitySearch from "./components/CitySearch";

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [activeTab, setActiveTab] = useState("your");

  // Clear weather data when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setWeatherData(null);  // Clear old data on tab change
  };

  useEffect(() => {
    if (locationGranted && activeTab === "your") {
      fetchWeatherByLocation();
    }
  }, [locationGranted, activeTab]);

  const fetchWeatherByLocation = () => {
    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude, longitude } = coords;
      const apiKey = "0d74ff70ee9979bc6e88870c73b5796d";
      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        setWeatherData(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }, handleGeoError);
  };

  // Handle geolocation errors separately
  const handleGeoError = (err) => {
    console.error("Geolocation error:", err);
    setIsLoading(false);
  };


  const fetchWeatherByCity = async (city) => {
    setIsLoading(true);
    setWeatherData(null); // Clear previous city or location weather while loading new one
    const apiKey = "0d74ff70ee9979bc6e88870c73b5796d";
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error("Error fetching weather for city:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#112D4E] to-[#3F72AF] text-white p-4">
      <h1 className="text-center text-3xl font-bold mb-12">WEATHER APP</h1>
      {/* Pass the handler to switch tab and clear data */}
      <TabSwitcher activeTab={activeTab} setActiveTab={handleTabChange} />

      {isLoading ? (
        <Loader />
      ) : activeTab === "your" ? (
        locationGranted ? (
          weatherData && <WeatherDisplay weatherData={weatherData} />
        ) : (
          <GeoWeather onGrant={() => setLocationGranted(true)} />
        )
      ) : (
        <>
          <CitySearch onCityFetch={fetchWeatherByCity} />
          {weatherData && <WeatherDisplay weatherData={weatherData} />}
        </>
      )}
    </div>
  );
}

export default App;
