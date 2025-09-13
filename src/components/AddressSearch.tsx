import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { geocodeAddress, fetchAmenities } from '../services/location.ts';
import { computeScores } from '../services/scoring.ts';
import { addHistoryEntry } from '../services/history.ts';
import { TextField, Button, Alert, Stack, Paper } from '@mui/material';
import { logger } from '../utils/logger.ts';

export default function AddressSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const geo = await geocodeAddress(query.trim());
      if (!geo) {
        setError('Address not found');
        logger.child('ui:address').debug('geocode returned null', { query });
        return;
      }
      const amenities = await fetchAmenities(geo.lat, geo.lon);
      const scores = computeScores(amenities);
      addHistoryEntry({
        query: query.trim(),
        displayName: geo.displayName,
        coords: { lat: geo.lat, lon: geo.lon },
        timestamp: Date.now()
      });
      navigate('/insights', {
        state: {
          displayName: geo.displayName,
          coords: { lat: geo.lat, lon: geo.lon },
          amenities,
          scores
        }
      });
    } catch (err: any) {
      logger.child('ui:address').error('search failed', { error: err.message || String(err) });
      setError(err.message || 'Unexpected error');
    } finally { setLoading(false); }
  }

  return (
    <Paper component="form" onSubmit={onSubmit} elevation={3} sx={{ p: 2, mb: 3 }} aria-label="Address search form">
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch">
        <TextField
          fullWidth
          label="Street address"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Enter a street address"
          size="small"
          disabled={loading}
        />
        <Button type="submit" variant="contained" color="primary" disabled={loading} sx={{ minWidth: 140 }}>
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Paper>
  );
}