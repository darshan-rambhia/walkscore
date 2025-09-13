import { Container, Typography, Box } from '@mui/material';
import AddressSearch from '../components/AddressSearch';
import SearchHistory from '../components/SearchHistory';
import PageSection from '../components/PageSection';

export default function HomePage() {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h2" component="h1" gutterBottom>
          WalkScore
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Discover how walkable any neighborhood is
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Get instant insights on nearby restaurants, shops, parks, and transit with interactive maps and custom scoring algorithms.
        </Typography>
      </Box>
      
      <AddressSearch />
      
      <PageSection title="Recent Searches">
        <SearchHistory />
      </PageSection>
    </Container>
  );
}