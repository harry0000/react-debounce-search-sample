import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Chip,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import { AppDispatch, RootState } from './store';
import { setQuery } from './store/searchSlice';
import { fetchSearchResults } from './store/searchThunks';
import SearchInput from './components/SearchInput';
import { useRef } from 'react';

export default function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { query, results, loading, error, abortedCount } = useSelector(
    (state: RootState) => state.search,
  );

  const pendingRequest = useRef<{ abort: (reason?: string) => void } | null>(null);

  const handleChange = useCallback(
    (value: string) => {
      dispatch(setQuery(value));
      pendingRequest.current?.abort();
      pendingRequest.current = dispatch(fetchSearchResults(value));
    },
    [dispatch],
  );

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Debounce Search Sample
        </Typography>

        <Box sx={{ width: '100%', maxWidth: 600 }}>
          <SearchInput
            fullWidth
            label="Search"
            placeholder="Type to search (debounced 500ms) — press Enter to search immediately"
            onChange={handleChange}
            variant="outlined"
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
      </Box>
    </Container>
  );
}
