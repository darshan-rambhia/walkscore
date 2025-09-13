import { Box, Typography, Chip, List, ListItem } from '@mui/material';
import type { Amenity } from '../services/location.ts';

interface Props {
  amenities: Amenity[];
}

export default function AmenityList({ amenities }: Props) {
  if (!amenities.length) {
    return (
      <Box textAlign="center" py={3}>
        <Typography variant="body2" color="text.secondary">
          No amenities found in this area
        </Typography>
      </Box>
    );
  }

  const sortedAmenities = [...amenities].sort((a, b) => a.distance - b.distance);

  return (
    <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
      {sortedAmenities.slice(0, 20).map((amenity) => (
        <ListItem key={amenity.id} sx={{ px: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap>
                {amenity.name || amenity.type}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip label={amenity.type} size="small" variant="outlined" />
                <Typography variant="caption" color="text.secondary">
                  {amenity.distance.toFixed(0)}m
                </Typography>
              </Box>
            </Box>
          </Box>
        </ListItem>
      ))}
      {amenities.length > 20 && (
        <ListItem sx={{ px: 0 }}>
          <Typography variant="caption" color="text.secondary">
            And {amenities.length - 20} more...
          </Typography>
        </ListItem>
      )}
    </List>
  );
}