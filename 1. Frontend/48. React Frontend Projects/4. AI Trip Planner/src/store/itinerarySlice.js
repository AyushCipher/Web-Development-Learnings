import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import validateItinerary from '../utils/validateItinerary.js';

export const generateItinerary = createAsyncThunk(
  'itinerary/generate',
  async ({ prompt, requestId }, { signal }) => {
    const controller = new AbortController();

    signal.addEventListener('abort', () => controller.abort());

    const timeout = setTimeout(() => controller.abort(), 45_000);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const text = await response.text();

      const validation = validateItinerary(text);

      return { validation, requestId, prompt };

    } catch (err) {
      clearTimeout(timeout);

      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Try a shorter prompt or try again.');
      }

      throw new Error(
        navigator.onLine === false
          ? 'You appear to be offline. Check your connection and try again.'
          : `Network error: ${err.message}`
      );
    }
  }
);

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState: {
    status: 'idle',
    data: null,
    errorMessage: null,
    requestId: null,
    lastPrompt: null,
  },
  reducers: {
    setRequestId(state, action) {
      state.requestId = action.payload;
    },

    removeStop(state, action) {
      const { dayId, stopId } = action.payload;
      if (!state.data?.days) return;

      const day = state.data.days.find((d) => d.id === dayId);
      if (day) {
        day.stops = day.stops.filter((s) => s.id !== stopId);
      }
    },

    reorderStops(state, action) {
      const { dayId, oldIndex, newIndex } = action.payload;
      if (!state.data?.days) return;

      const day = state.data.days.find((d) => d.id === dayId);
      if (day && day.stops) {
        const [moved] = day.stops.splice(oldIndex, 1);
        day.stops.splice(newIndex, 0, moved);
      }
    },

    clearItinerary(state) {
      state.status = 'idle';
      state.data = null;
      state.errorMessage = null;
      state.requestId = null;
      state.lastPrompt = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(generateItinerary.pending, (state, action) => {
        state.status = 'loading';
        state.errorMessage = null;
        state.lastPrompt = action.meta.arg.prompt;
      })

      .addCase(generateItinerary.fulfilled, (state, action) => {
        const { validation, requestId, prompt } = action.payload;

        // Protection against a race condition
        if (requestId !== state.requestId) {
          return;
        }

        state.lastPrompt = prompt;

        if (validation.valid) {
          state.status = 'success';
          state.data = validation.data;
          state.errorMessage = null;
        } else {
          state.status = 'error';
          state.data = null;
          state.errorMessage =
            validation.errors.join('. ') ||
            'The AI returned an unexpected response. Please try again.';
        }
      })
      .addCase(generateItinerary.rejected, (state, action) => {
        const requestId = action.meta?.arg?.requestId;
        if (requestId && requestId !== state.requestId) {
          return;
        }

        state.status = 'error';
        state.data = null;
        state.errorMessage =
          action.error?.message || 'Something went wrong. Please try again.';
      });
  },
});

export const { setRequestId, removeStop, reorderStops, clearItinerary } =
  itinerarySlice.actions;

export default itinerarySlice.reducer;
