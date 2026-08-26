import React, { useState } from 'react';

const CATEGORY_COLORS = {
  accommodation: '#6366f1',
  food: '#f59e0b',
  activity: '#10b981',
  transport: '#3b82f6',
  shopping: '#ec4899',
  nightlife: '#8b5cf6',
};

const CATEGORY_EMOJIS = {
  accommodation: '🏨',
  food: '🍽️',
  activity: '🎯',
  transport: '🚗',
  shopping: '🛍️',
  nightlife: '🌙',
};

export default function StopCard({ stop, onRemove, dragHandleProps }) {
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleRemoveClick = () => {
    if (confirmRemove) {
      onRemove(stop.id);
    } else {
      setConfirmRemove(true);
      setTimeout(() => setConfirmRemove(false), 3000);
    }
  };

  const categoryColor = CATEGORY_COLORS[stop.category] || '#39766d';
  const categoryEmoji = CATEGORY_EMOJIS[stop.category] || '📍';

  return (
    <div className="mb-3 flex items-center gap-4 rounded-xl border border-ink/10 border-l-4 bg-white p-4 text-ink shadow-sm transition hover:-translate-y-px hover:shadow-md max-md:relative max-md:flex-col max-md:items-start max-md:pt-10" style={{ borderLeftColor: categoryColor }}>
      <div
        className="flex cursor-grab select-none items-center justify-center p-1 text-xl text-ink/45 active:cursor-grabbing max-md:absolute max-md:left-4 max-md:top-3"
        {...(dragHandleProps || {})}
        aria-label="Drag handle"
      >
        ⠿
      </div>

      <div className="shrink-0 rounded-lg bg-paper px-2 py-1 text-sm font-bold text-ink/65">
        {stop.time}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <h3 className="font-display text-lg font-semibold text-ink">{stop.name}</h3>
        <p className="text-sm leading-6 text-ink/65">{stop.description}</p>
        {stop.tips && (
          <p className="mt-1 flex items-center gap-1 text-sm italic text-ink/55">
            <span role="img" aria-label="tip">💡</span> {stop.tips}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2 max-md:w-full max-md:flex-row max-md:flex-wrap max-md:items-center">
        <span
          className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold capitalize"
          style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
        >
          {categoryEmoji} <span className="stop-card__category-text">{stop.category}</span>
        </span>
        {stop.duration && (
          <span className="text-xs text-ink/60">⏱️ {stop.duration}</span>
        )}
        {stop.estimatedCost && (
          <span className="text-xs text-ink/60">💰 {stop.estimatedCost}</span>
        )}
      </div>

      <button
        className={`flex shrink-0 items-center justify-center rounded-lg p-2 text-sm transition hover:bg-sand ${confirmRemove ? 'bg-red-100 font-bold text-red-700 hover:bg-red-200' : 'text-ink/55 hover:text-ink'} max-md:absolute max-md:right-3 max-md:top-2`}
        onClick={handleRemoveClick}
        aria-label="Remove stop"
      >
        {confirmRemove ? 'Remove?' : '✕'}
      </button>
    </div>
  );
}
