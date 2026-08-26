import React from 'react';

const LoadingState = () => {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4" aria-live="polite" aria-busy="true">
      <div className="h-12 w-3/5 animate-pulse rounded-xl bg-sand"></div>
      
      <div className="flex flex-col gap-6">
        {[1, 2, 3].map((day) => (
          <div key={day} className="animate-pulse rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
            <div className="mb-6 h-6 w-2/5 rounded-lg bg-sand"></div>
            <div className="flex flex-col gap-4">
              {[1, 2, 3].map((stop) => (
                <div key={stop} className="h-15 w-full rounded-xl bg-sand/80"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-1 animate-pulse text-center text-base font-medium text-pine">Creating your itinerary...</p>
    </div>
  );
};

export default LoadingState;
