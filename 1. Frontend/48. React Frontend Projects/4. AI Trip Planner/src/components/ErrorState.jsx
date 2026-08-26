import React from 'react';

const ErrorState = ({ message, onRetry }) => {
  return (
    <div className="mx-auto my-8 flex max-w-lg flex-col items-center rounded-2xl border border-red-300 bg-red-50 px-5 py-8 text-center shadow-sm sm:px-8" role="alert">
      <div className="mb-3 text-5xl" aria-hidden="true">⚠️</div>
      <h3 className="font-display text-2xl font-semibold text-red-800">Something went wrong</h3>
      <p className="mt-2 break-words text-base leading-7 text-ink/80">
        {message || "We encountered an unexpected error while planning your trip."}
      </p>
      {onRetry && (
        <button 
          className="mt-5 min-h-11 rounded-xl bg-terracotta px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a9553c] active:scale-[.98]" 
          onClick={onRetry}
          aria-label="Try again"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
