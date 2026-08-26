import React from "react";

const WeatherDisplay = ({ weatherData }) => {
  if (
    !weatherData ||
    !weatherData.weather ||
    !weatherData.main ||
    !weatherData.wind ||
    !weatherData.clouds ||
    !weatherData.sys
  ) {
    return (
      <p className="text-center text-red-400">
        Invalid or incomplete weather data.
      </p>
    );
  }

  const { name, main, weather, wind, clouds, sys } = weatherData;

  return (
    <div className="text-center mt-0">
      <h2 className="text-3xl font-bold mb-2 flex justify-center items-center gap-2">
        {name}
        <img
          src={`https://flagcdn.com/32x24/${sys.country.toLowerCase()}.png`}
          alt={`${sys.country} flag`}
          className="inline-block w-6 h-4 object-cover rounded shadow"
        />
      </h2>

      <p className="capitalize text-lg">{weather[0].description}</p>

      <img
        src={`https://openweathermap.org/img/wn/${weather[0].icon}@2x.png`}
        alt="weather icon"
        className="mx-auto"
      />

      <h1 className="text-4xl font-bold">{main.temp.toFixed(1)}°C</h1>

      <div className="flex justify-center gap-4 mt-6">
        <div className="bg-white/30 px-4 py-2 rounded text-center min-w-[90px]">
          <p className="text-xs font-bold">WINDSPEED</p>
          <p className="text-sm">{wind.speed} m/s</p>
        </div>
        <div className="bg-white/30 px-4 py-2 rounded text-center min-w-[90px]">
          <p className="text-xs font-bold">HUMIDITY</p>
          <p className="text-sm">{main.humidity}%</p>
        </div>
        <div className="bg-white/30 px-4 py-2 rounded text-center min-w-[90px]">
          <p className="text-xs font-bold">CLOUDS</p>
          <p className="text-sm">{clouds.all}%</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;

