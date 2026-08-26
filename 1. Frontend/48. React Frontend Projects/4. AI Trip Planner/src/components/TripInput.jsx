import React, { useState, useEffect, useRef } from 'react';

const MAX_CHARS = 1000;

const TripInput = ({ onSubmit, isLoading, initialValue = '' }) => {
  const [text, setText] = useState(initialValue);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (initialValue !== undefined) {
      setText(initialValue);
    }
  }, [initialValue]);

  const handleChange = (e) => {
    const newText = e.target.value;
    if (newText.length <= MAX_CHARS) {
      setText(newText);
    }
  };

  const handleSubmit = () => {
    if (text.trim() && !isLoading) {
      onSubmit(text);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const isSubmitDisabled = !text.trim() || isLoading;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="flex flex-col gap-4 rounded-2xl border border-ink/15 bg-white p-4 shadow-sm transition focus-within:border-pine/60 focus-within:ring-4 focus-within:ring-pine/10 sm:p-5">
        <textarea
          ref={textareaRef}
          className="min-h-28 w-full resize-y bg-transparent text-base leading-7 text-ink outline-none placeholder:text-ink/45 disabled:cursor-not-allowed disabled:opacity-60"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Describe your dream trip... e.g., A 5-day adventure in Japan for 2 people with a moderate budget, interested in food, temples, and nightlife"
          rows={4}
          maxLength={MAX_CHARS}
          aria-label="Trip description"
        />
        <div className="flex items-center justify-between gap-4 border-t border-ink/10 pt-3">
          <span 
            className={`text-sm ${text.length >= MAX_CHARS ? 'font-semibold text-red-700' : 'text-ink/55'}`}
            aria-live="polite"
          >
            {text.length} / {MAX_CHARS}
          </span>
          <button
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-terracotta px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a9553c] active:translate-y-px sm:px-6 sm:text-base"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="size-5 animate-spin rounded-full border-2 border-white/35 border-t-white" aria-hidden="true"></span>
            ) : (
              <span aria-hidden="true">✨</span>
            )}
            <span className="trip-input__submit-text">Generate Itinerary</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default TripInput;
