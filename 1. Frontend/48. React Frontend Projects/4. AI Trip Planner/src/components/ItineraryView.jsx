import React from 'react';
import { useDispatch } from 'react-redux';
import { removeStop } from '../store/itinerarySlice';
import DayCard from './DayCard';

export default function ItineraryView({ data }) {
  const dispatch = useDispatch();

  const handleRemoveStop = (dayId, stopId) => {
    dispatch(removeStop({ dayId, stopId }));
  };

  if (!data) {
    return <div className="mx-auto max-w-5xl p-6 text-ink/65">Loading itinerary...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl px-0 py-2 sm:px-4">
      <header className="mb-8 rounded-2xl border border-ink/10 bg-white px-5 py-8 text-center shadow-sm sm:mb-10 sm:px-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-terracotta sm:text-4xl">{data.tripTitle}</h1>
        <div className="mt-3 flex items-center justify-center gap-2 text-base text-ink/65 sm:text-lg">
          <span role="img" aria-label="pin">📍</span> {data.destination}
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
          <div className="flex items-center justify-center gap-2 rounded-xl border border-ink/10 bg-paper px-4 py-2 text-sm font-semibold">
            <span role="img" aria-label="duration">🗓️</span> {data.duration}
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl border border-ink/10 bg-paper px-4 py-2 text-sm font-semibold">
            <span role="img" aria-label="travelers">👥</span> {data.travelers}
          </div>
          <div className="flex items-center justify-center gap-2 rounded-xl border border-ink/10 bg-paper px-4 py-2 text-sm font-semibold">
            <span role="img" aria-label="budget">💰</span> {data.estimatedBudget}
          </div>
        </div>
      </header>

      <div className="relative sm:pl-6">
        {data.days && data.days.map((day, index) => (
          <div 
            key={day.id} 
            className="relative mb-6 opacity-100 sm:before:absolute sm:before:-left-6 sm:before:top-8 sm:before:h-full sm:before:w-px sm:before:bg-ink/15 sm:last:before:hidden"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="hidden sm:absolute sm:-left-6 sm:top-8 sm:block sm:h-px sm:w-4 sm:bg-ink/15"></div>
            <DayCard day={day} onRemoveStop={handleRemoveStop} />
          </div>
        ))}
      </div>
    </div>
  );
}
