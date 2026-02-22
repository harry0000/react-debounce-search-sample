import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  TextField,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Typography,
  Box,
  Chip,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { AppDispatch, RootState } from '../store';
import { setQuery } from '../store/searchSlice';
import { fetchSearchResults } from '../store/searchThunks';

const DEBOUNCE_DELAY_MS = 500;

export default function SearchInput() {
  const dispatch = useDispatch<AppDispatch>();
  const { query, results, loading, error, abortedCount } = useSelector(
    (state: RootState) => state.search,
  );

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Holds the dispatched thunk promise so we can call abort() on it
  const pendingRequest = useRef<{ abort: (reason?: string) => void } | null>(null);

  const clearDebounce = useCallback(() => {
    if (debounceTimer.current !== null) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }
  }, []);

  const triggerSearch = useCallback(
    (value: string) => {
      // Cancel the previous in-flight request before dispatching a new one.
      // Because fakeApiCall respects AbortSignal, the timer is cleared immediately
      // and RTK dispatches rejected(meta.aborted: true) for the old request.
      pendingRequest.current?.abort();
      pendingRequest.current = dispatch(fetchSearchResults(value));
    },
    [dispatch],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      dispatch(setQuery(value));

      clearDebounce();
      debounceTimer.current = setTimeout(() => {
        triggerSearch(value);
      }, DEBOUNCE_DELAY_MS);
    },
    [dispatch, clearDebounce, triggerSearch],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        clearDebounce();
        triggerSearch(query);
      }
    },
    [clearDebounce, triggerSearch, query],
  );

  useEffect(() => {
    return () => {
      if (debounceTimer.current !== null) {
        clearTimeout(debounceTimer.current);
      }
      // Abort any in-flight request on unmount
      pendingRequest.current?.abort();
    };
  }, []);

  return (
    <Box sx={{ width: '100%', maxWidth: 600 }}>
      <TextField
        fullWidth
        label="Search"
        placeholder="Type to search (debounced 500ms) — press Enter to search immediately"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                {loading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <SearchIcon />
                )}
              </InputAdornment>
            ),
          },
        }}
        variant="outlined"
      />

      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap', minHeight: 32 }}>
        <Chip
          size="small"
          label={`Aborted requests: ${abortedCount}`}
          color={abortedCount > 0 ? 'warning' : 'default'}
          variant="outlined"
        />
        {loading && (
          <Chip size="small" label="Fetching..." color="info" variant="outlined" />
        )}
      </Box>

      {error && (
        <Typography color="error" sx={{ mt: 1 }}>
          Error: {error}
        </Typography>
      )}

      {!loading && !error && results.length > 0 && (
        <Paper variant="outlined" sx={{ mt: 2 }}>
          <List dense>
            {results.map((result) => (
              <ListItem key={result.id} divider>
                <ListItemText primary={result.label} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {!loading && !error && query && results.length === 0 && (
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          No results found
        </Typography>
      )}
    </Box>
  );
}
