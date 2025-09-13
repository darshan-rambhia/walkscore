import { useLocation } from 'react-router-dom';
import { useState, useMemo, useCallback } from 'react';
import MapView from '../components/MapView';
import ScoresPanel from '../components/ScoresPanel';
import type { ScoreBreakdown } from '../services/scoring.ts';
import AmenityList from '../components/AmenityList';
import { type Amenity } from '../services/location.ts';
import { fetchAmenities } from '../services/location.ts';
import { computeScores } from '../services/scoring.ts';
import { Container, Typography, CircularProgress, Alert, Box, Button, Snackbar } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { logger } from '../utils/logger.ts';
import PageSection from '../components/PageSection.tsx';
import { buildShareUrl, parseSharedParams } from '../services/share.ts';

interface InsightState {
  displayName?: string;
  coords?: { lat: number; lon: number };
  amenities?: Amenity[];
  scores?: unknown;
}

// Custom hook to handle amenities data
function useAmenitiesData(
  state: InsightState | undefined,
  initialAmenities: Amenity[],
  initialScores: unknown,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [amenities, setAmenities] = useState(initialAmenities);
  const [scores, setScores] = useState(initialScores);
  const log = logger.child('ui:insights');
  const fetchData = useCallback(async () => {
    if (!state?.coords || (amenities.length && scores)) return;

    setLoading(true);
    setError(null);

    try {
      log.debug('fallback fetch start', { coords: state.coords });
      const list = await fetchAmenities(state.coords.lat, state.coords.lon);
      const sc = computeScores(list);
      setAmenities(list);
      setScores(sc);
      log.info('fallback fetch success', { count: list.length });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      log.error('fallback fetch error', { error: msg });
      setError(msg || 'Failed to load amenities');
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
  let state = location.state;

  // If no navigation state but we have share params, synthesize minimal state
  if (!state?.coords) {
    const parsed = parseSharedParams(location.search);
    if (parsed) {
      state = {
        displayName: parsed.label || `${parsed.lat.toFixed(4)}, ${parsed.lon.toFixed(4)}`,
        coords: { lat: parsed.lat, lon: parsed.lon }
      };
    }
  }

  const initialAmenities = state?.amenities || [];
  const initialScores = state?.scores;
  const [shareOpen, setShareOpen] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

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
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
          <Typography variant="h4" gutterBottom sx={{ m: 0 }}>Insights for {state.displayName}</Typography>
          <Button
            variant="outlined"
            onClick={() => {
              try {
                const url = buildShareUrl(window.location.origin, state.coords, state.displayName);
                navigator.clipboard.writeText(url)
                  .then(() => setShareOpen(true))
                  .catch(err => setShareError(err.message || 'Copy failed'));
              } catch (e) {
                setShareError(e instanceof Error ? e.message : 'Share failed');
              }
            }}
            size="small"
          >
            Copy Share Link
          </Button>
        </Box>
        <Grid container spacing={3} sx={{ minHeight: { md: '600px' } }}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
              <PageSection title="Scores">
                {scores ? (
                  <ScoresPanel scores={scores as ScoreBreakdown} />
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
      <Snackbar
        open={shareOpen}
        autoHideDuration={3000}
        onClose={() => setShareOpen(false)}
        message="Link copied to clipboard"
      />
      <Snackbar
        open={!!shareError}
        autoHideDuration={4000}
        onClose={() => setShareError(null)}
      >
        <Alert severity="error" onClose={() => setShareError(null)} sx={{ width: '100%' }}>
          {shareError}
        </Alert>
      </Snackbar>
    </>
  );
}