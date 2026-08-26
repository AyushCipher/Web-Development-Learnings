import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  generateItinerary,
  setRequestId,
} from './store/itinerarySlice.js';

import TripInput from './components/TripInput.jsx';
import ItineraryView from './components/ItineraryView.jsx';
import LoadingState from './components/LoadingState.jsx';
import ErrorState from './components/ErrorState.jsx';
import EmptyState from './components/EmptyState.jsx';


function App() {
  const dispatch = useDispatch();
  const { status, data, errorMessage, lastPrompt } = useSelector(
    (state) => state.itinerary
  );

  const [inputValue, setInputValue] = useState('');

  const handleSubmit = useCallback(
    (prompt) => {
      const requestId = crypto.randomUUID();

      dispatch(setRequestId(requestId));
      dispatch(generateItinerary({ prompt, requestId }));
    },
    [dispatch]
  );


  const handleExampleClick = useCallback((text) => {
    setInputValue(text);
  }, []);


  const handleRetry = useCallback(() => {
    if (lastPrompt) {
      handleSubmit(lastPrompt);
    }
  }, [lastPrompt, handleSubmit]);

  const renderResults = () => {
    switch (status) {
      case 'idle':
        return <EmptyState onExampleClick={handleExampleClick} />;
      case 'loading':
        return <LoadingState />;
      case 'error':
        return <ErrorState message={errorMessage} onRetry={handleRetry} />;
      case 'success':
        return <ItineraryView data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-paper">
      <header className="px-5 pt-10 pb-7 text-center sm:px-8 sm:pt-14">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">✈ AI Trip Planner</h1>
        <p className="mt-2 text-sm leading-6 text-ink/65 sm:text-base">
          Describe your dream trip and let AI create the perfect itinerary
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-14 sm:px-6">
        <section className="mb-8">
          <TripInput
            onSubmit={handleSubmit}
            isLoading={status === 'loading'}
            initialValue={inputValue}
          />
        </section>

        <section className="min-h-50" aria-live="polite">
          {renderResults()}
        </section>
      </main>
    </div>
  );
}

export default App;


