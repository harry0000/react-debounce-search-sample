import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchSearchResults } from './searchThunks';

export interface SearchResult {
  id: number;
  label: string;
}

interface SearchState {
  query: string;
  results: SearchResult[];
  loading: boolean;
  error: string | null;
  // Number of in-flight requests cancelled by a newer request
  abortedCount: number;
}

const initialState: SearchState = {
  query: '',
  results: [],
  loading: false,
  error: null,
  abortedCount: 0,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, action: PayloadAction<string>) {
      state.query = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action) => {
        // abort() guarantees no stale fulfilled ever arrives, so no requestId check needed
        state.results = action.payload;
        state.error = null;
        state.loading = false;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        if (action.meta.aborted) {
          // Previous request was cancelled because a newer one was dispatched.
          // Keep loading true — the new request is already pending.
          state.abortedCount += 1;
          return;
        }
        state.error = action.error.message ?? 'Unknown error';
        state.loading = false;
      });
  },
});

export const { setQuery } = searchSlice.actions;

export default searchSlice.reducer;
