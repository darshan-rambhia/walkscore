import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getHistory, clearHistory } from '../services/history.ts';
import { fetchAmenities } from '../services/location.ts';
import { computeScores } from '../services/scoring.ts';
import { 
  List, ListItem, ListItemText, ListItemButton, 
  Typography, Box, Button 
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import type { HistoryEntry } from '../services/history.ts';

export default function SearchHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleEntryClick = async (entry: HistoryEntry) => {
    try {
      const amenities = await fetchAmenities(entry.coords.lat, entry.coords.lon);
      const scores = computeScores(amenities);
      
      navigate('/insights', {
        state: {
          displayName: entry.displayName,
          coords: entry.coords,
          amenities,
          scores
        }
      });
    } catch (error) {
      console.error('Failed to load insights for history entry:', error);
    }
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  if (!history.length) {
    return (
      <Box textAlign="center" py={3}>
        <Typography variant="body2" color="text.secondary">
          No recent searches
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2" color="text.secondary">
          {history.length} recent search{history.length !== 1 ? 'es' : ''}
        </Typography>
        <Button size="small" onClick={handleClearHistory} startIcon={<DeleteIcon />}>
          Clear
        </Button>
      </Box>
      
      <List dense>
        {history.map((entry) => (
          <ListItem key={`${entry.coords.lat}-${entry.coords.lon}-${entry.timestamp}`} disablePadding>
            <ListItemButton onClick={() => handleEntryClick(entry)}>
              <ListItemText
                primary={entry.query}
                secondary={new Date(entry.timestamp).toLocaleDateString()}
                primaryTypographyProps={{ noWrap: true }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}