import { useLocation } from 'react-router-dom';
import { useState, useMemo, useCallback } from 'react';
import MapView from '../components/MapView';
import ScoresPanel from '../components/ScoresPanel';
import AmenityList from '../components/AmenityList';
import { fetchAmenities } from '../services/location.ts';
import { computeScores } from '../services/scoring.ts';
import { Container, Typography, CircularProgress, Alert, Box } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { logger } from '../utils/logger.ts';
import PageSection from '../components/PageSection.tsx';

// Custom hook to handle amenities data
function useAmenitiesData(state: any, initialAmenities: any[], initialScores: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amenities, setAmenities] = useState(initialAmenities);
  const [scores, setScores] = useState(initialScores);

  const fetchData = useCallback(async () => {
    if (!state?.coords || (amenities.length && scores)) return;
    
    setLoading(true);
    setError(null);
    
    try {
      logger.child('ui:insights').debug('fallback fetch start', { coords: state.coords });
      const list = await fetchAmenities(state.coords.lat, state.coords.lon);
      const sc = computeScores(list);
      setAmenities(list);
      setScores(sc);
      logger.child('ui:insights').info('fallback fetch success', { count: list.length });
    } catch (err: any) {
      logger.child('ui:insights').error('fallback fetch error', { error: err.message || String(err) });
      setError(err.message || 'Failed to load amenities');
    } finally {
      setLoading(false);
    }
  }, [state?.coords?.lat, state?.coords?.lon, amenities.length, scores]);

  // Trigger fetch when needed
  useMemo(() => {
    fetchData();
  }, [fetchData]);

  return { amenities, scores, loading, error };
}

export default function InsightsPage() {
  const location = useLocation();
  const state = location.state;
  const initialAmenities = state?.amenities || [];
  const initialScores = state?.scores;
  
  // Use custom hook instead of useEffect
  const { amenities, scores, loading, error } = useAmenitiesData(state, initialAmenities, initialScores);

  if (!state?.coords) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="info">No address selected. Go back and search.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>Insights for {state.displayName}</Typography>
      <Grid container spacing={3} sx={{ minHeight: { md: '600px' } }}>
        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
            <PageSection title="Scores">
              {scores ? (
                <ScoresPanel scores={scores} />
              ) : (
                <Box display="flex" flexDirection="column" alignItems="center" py={2}>
                  {loading && <CircularProgress size={32} sx={{ mb: 1 }} />}
                  <Typography variant="body2" color="text.secondary">
                    {loading ? 'Calculating scores…' : 'Scores will appear shortly.'}
                  </Typography>
                </Box>
              )}
            </PageSection>
            {error && <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>}
            {loading && !error && (
              <Alert severity="info" sx={{ mb: 1 }}>Loading nearby amenities…</Alert>
            )}
            <PageSection title="Amenities">
              <AmenityList amenities={amenities} />
            </PageSection>
          </Box>
        </Grid>
        
        {/* Map */}
        <Grid size={{ xs: 12, md: 8 }}>
          <PageSection pad={false} minHeight={400}>
            <Box sx={{ position: 'relative', width: '100%', height: { xs: 360, sm: 420, md: 600 } }}>
              <MapView center={state.coords} amenities={amenities} displayName={state.displayName} />
            </Box>
          </PageSection>
        </Grid>
      </Grid>
    </Container>
  );
}