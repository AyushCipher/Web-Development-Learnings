import { describe, it, expect } from 'vitest';
import validateItinerary from '../validateItinerary.js';

const VALID_ITINERARY = {
  tripTitle: '3 Days in Tokyo',
  destination: 'Tokyo, Japan',
  duration: '3 days',
  travelers: 2,
  estimatedBudget: '$2,000',
  days: [
    {
      dayNumber: 1,
      title: 'Arrival & Shibuya',
      stops: [
        {
          time: '10:00 AM',
          name: 'Shibuya Crossing',
          description: 'Visit the famous scramble crossing.',
          category: 'activity',
          estimatedCost: '$0',
          duration: '1 hour',
          tips: 'Go early to avoid crowds.',
        },
        {
          time: '12:00 PM',
          name: 'Ichiran Ramen',
          description: 'Try the solo-booth ramen experience.',
          category: 'food',
          estimatedCost: '$15',
          duration: '45 minutes',
          tips: 'Customize your noodle firmness.',
        },
      ],
    },
    {
      dayNumber: 2,
      title: 'Temples & Gardens',
      stops: [
        {
          time: '9:00 AM',
          name: 'Senso-ji Temple',
          description: 'Tokyo\'s oldest temple in Asakusa.',
          category: 'activity',
          estimatedCost: '$0',
          duration: '2 hours',
          tips: 'Visit the Nakamise shopping street nearby.',
        },
      ],
    },
  ],
};

describe('validateItinerary', () => {
  it('accepts a valid complete itinerary', () => {
    const result = validateItinerary(JSON.stringify(VALID_ITINERARY));

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data).not.toBeNull();
    expect(result.data.destination).toBe('Tokyo, Japan');
    expect(result.data.days).toHaveLength(2);
    expect(result.data.days[0].stops).toHaveLength(2);
    expect(result.data.days[0].id).toBeDefined();
    expect(result.data.days[0].stops[0].id).toBeDefined();
  });

  it('rejects a malformed JSON string without crashing', () => {
    const result = validateItinerary('{ this is not valid json!!!');

    expect(result.valid).toBe(false);
    expect(result.data).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toMatch(/parse/i);
  });

  it('rejects valid JSON with wrong shape', () => {
    const result = validateItinerary(JSON.stringify({ foo: 'bar' }));

    expect(result.valid).toBe(false);
    expect(result.data).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors.some((e) => e.toLowerCase().includes('days'))).toBe(true);
  });

  it('rejects an itinerary with empty days array', () => {
    const result = validateItinerary(
      JSON.stringify({ destination: 'Tokyo', days: [] })
    );

    expect(result.valid).toBe(false);
    expect(result.data).toBeNull();
    expect(result.errors.some((e) => e.toLowerCase().includes('no days'))).toBe(true);
  });

  it('parses JSON wrapped in markdown code fences', () => {
    const fenced = '```json\n' + JSON.stringify(VALID_ITINERARY) + '\n```';
    const result = validateItinerary(fenced);

    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.data.destination).toBe('Tokyo, Japan');
    expect(result.data.days).toHaveLength(2);
  });

  it('handles null input without crashing', () => {
    const result = validateItinerary(null);

    expect(result.valid).toBe(false);
    expect(result.data).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('handles empty string without crashing', () => {
    const result = validateItinerary('');

    expect(result.valid).toBe(false);
    expect(result.data).toBeNull();
    expect(result.errors.some((e) => e.toLowerCase().includes('empty'))).toBe(true);
  });

  it('detects backend error responses', () => {
    const result = validateItinerary(
      JSON.stringify({ error: true, reason: 'timeout', message: 'Request timed out' })
    );

    expect(result.valid).toBe(false);
    expect(result.data).toBeNull();
    expect(result.errors[0]).toMatch(/timed out/i);
  });
});
