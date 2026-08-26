import React from 'react';

const examples = [
  '3 days in Tokyo on a budget',
  'Week-long family trip to Italy',
  'Romantic weekend in Paris',
  'Adventure in the Swiss Alps'
];

const EmptyState = ({ onExampleClick }) => {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center rounded-2xl border border-ink/10 bg-white px-6 py-10 text-center shadow-sm sm:px-10 sm:py-12">
      <div className="mb-3 text-5xl" aria-hidden="true">✈️</div>
      <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">Plan Your Dream Trip</h2>
      <p className="mt-3 max-w-md text-base leading-7 text-ink/65">
        Describe your ideal trip below and our AI will create a detailed day-by-day itinerary for you.
      </p>
      
      <div className="mt-8 w-full">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">Try asking for:</p>
        <div className="flex flex-wrap justify-center gap-2">
          {examples.map((example, index) => (
            <button 
              key={index}
              className="rounded-full border border-ink/15 px-3.5 py-2 text-sm text-ink/75 transition hover:-translate-y-0.5 hover:border-pine/50 hover:bg-pine/8 hover:text-pine"
              onClick={() => onExampleClick && onExampleClick(example)}
              aria-label={`Use example prompt: ${example}`}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
