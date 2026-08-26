import { describe, expect, it } from 'vitest';
import itineraryReducer, {
  generateItinerary,
  setRequestId,
} from '../itinerarySlice.js';

describe('itinerary stale-request handling', () => {
  it('keeps the latest request loading when an older request rejects', () => {
    let state = itineraryReducer(undefined, setRequestId('request-b'));
    state = itineraryReducer(
      state,
      generateItinerary.pending('thunk-b', { prompt: 'Latest', requestId: 'request-b' })
    );

    const result = itineraryReducer(
      state,
      generateItinerary.rejected(
        new Error('Older request failed'),
        'thunk-a',
        { prompt: 'Older', requestId: 'request-a' }
      )
    );

    expect(result.status).toBe('loading');
    expect(result.errorMessage).toBeNull();
  });

  it('stores the prompt before a request fails so Retry can resubmit it', () => {
    const request = { prompt: 'Weekend in Paris', requestId: 'request-a' };
    let state = itineraryReducer(undefined, setRequestId(request.requestId));
    state = itineraryReducer(state, generateItinerary.pending('thunk-a', request));
    state = itineraryReducer(
      state,
      generateItinerary.rejected(new Error('Network error'), 'thunk-a', request)
    );

    expect(state.status).toBe('error');
    expect(state.lastPrompt).toBe('Weekend in Paris');
  });
});
