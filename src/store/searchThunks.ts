import { createAsyncThunk } from '@reduxjs/toolkit';
import type { SearchResult } from './searchSlice';

/**
 * Simulated API call that respects AbortSignal.
 * Models a cancellable API: the in-flight timer is cleared immediately on abort.
 */
function fakeApiCall(query: string, signal: AbortSignal): Promise<SearchResult[]> {
  return new Promise((resolve, reject) => {
    // Reject immediately if the signal was already aborted before this call
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const delay = 300 + Math.random() * 700; // random delay between 300-1000ms

    const timer = setTimeout(() => {
      resolve(
        query
          ? Array.from({ length: 5 }, (_, i) => ({
              id: i + 1,
              label: `Result ${i + 1} for "${query}"`,
            }))
          : [],
      );
    }, delay);

    // Cancel the timer as soon as the signal fires
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export const fetchSearchResults = createAsyncThunk(
  'search/fetchResults',
  async (query: string, { signal }) => {
    return await fakeApiCall(query, signal);
  },
);
