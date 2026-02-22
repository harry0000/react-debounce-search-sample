import { Container, Typography, Box } from '@mui/material';
import SearchInput from './components/SearchInput';

export default function App() {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Debounce Search Sample
        </Typography>
        <SearchInput />
      </Box>
    </Container>
  );
}
