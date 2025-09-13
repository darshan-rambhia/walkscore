import { Box, Typography, LinearProgress, Chip } from '@mui/material';
import type { ScoreBreakdown } from '../services/scoring.ts';

interface Props {
  scores: ScoreBreakdown;
}

export default function ScoresPanel({ scores }: Readonly<Props>) {
  const getScoreColor = (score: number): 'success' | 'warning' | 'error' => {
    if (score >= 70) return 'success';
    if (score >= 40) return 'warning';
    return 'error';
  };

  const getUrbanLabel = (index: number): string => {
    if (index >= 70) return 'Urban';
    if (index >= 40) return 'Mixed';
    return 'Suburban';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">Walking Score</Typography>
          <Typography variant="h6" color={getScoreColor(scores.walkingScore) + '.main'}>
            {scores.walkingScore}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={scores.walkingScore} 
          color={getScoreColor(scores.walkingScore)}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">Driving Score</Typography>
          <Typography variant="h6" color={getScoreColor(scores.drivingScore) + '.main'}>
            {scores.drivingScore}
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={scores.drivingScore} 
          color={getScoreColor(scores.drivingScore)}
          sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="body2" color="text.secondary">Urban Index</Typography>
          <Typography variant="h6" color={getScoreColor(scores.urbanSuburbanIndex) + '.main'}>
            {scores.urbanSuburbanIndex}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
            value={scores.urbanSuburbanIndex}
            color={getScoreColor(scores.urbanSuburbanIndex)}
            sx={{ height: 8, borderRadius: 4 }}
        />
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">Area Type</Typography>
        <Chip 
          label={getUrbanLabel(scores.urbanSuburbanIndex)}
          color={getScoreColor(scores.urbanSuburbanIndex)}
          size="small"
        />
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2" color="text.secondary">Total Amenities</Typography>
        <Typography variant="body1" fontWeight="medium">
          {scores.totalAmenities}
        </Typography>
      </Box>
    </Box>
  );
}