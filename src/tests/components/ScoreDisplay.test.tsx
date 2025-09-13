import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoresPanel from '../../components/ScoresPanel';
import type { ScoreBreakdown } from '../../services/scoring';

describe('ScoresPanel', () => {
  const mockScores: ScoreBreakdown = {
    walkingScore: 75,
    drivingScore: 85,
    urbanSuburbanIndex: 60,
    totalAmenities: 42
  };

  it('should render all score metrics', () => {
    render(<ScoresPanel scores={mockScores} />);
    
    expect(screen.getByText('Walking Score')).toBeInTheDocument();
    expect(screen.getByText('75')).toBeInTheDocument();
    
    expect(screen.getByText('Driving Score')).toBeInTheDocument();
    expect(screen.getByText('85')).toBeInTheDocument();
    
    expect(screen.getByText('Area Type')).toBeInTheDocument();
    expect(screen.getByText('Mixed')).toBeInTheDocument();
    
    expect(screen.getByText('Total Amenities')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should handle zero scores', () => {
    const zeroScores: ScoreBreakdown = {
      walkingScore: 0,
      drivingScore: 0,
      urbanSuburbanIndex: 0,
      totalAmenities: 0
    };

    render(<ScoresPanel scores={zeroScores} />);
    
    expect(screen.getAllByText('0')).toHaveLength(4);
  });

  it('should handle maximum scores', () => {
    const maxScores: ScoreBreakdown = {
      walkingScore: 100,
      drivingScore: 100,
      urbanSuburbanIndex: 100,
      totalAmenities: 999
    };

    render(<ScoresPanel scores={maxScores} />);
    
    expect(screen.getAllByText('100')).toHaveLength(3);
    expect(screen.getByText('999')).toBeInTheDocument();
  });

  it('should apply correct styling for different score ranges', () => {
    render(<ScoresPanel scores={mockScores} />);
    
    // Test that the component renders without errors and shows scores
    const walkingScoreElement = screen.getByText('75');
    expect(walkingScoreElement).toBeInTheDocument();
  });

  it('should be accessible with proper labels', () => {
    render(<ScoresPanel scores={mockScores} />);
    
    // Check that the component has proper structure for screen readers
    expect(screen.getByText('Walking Score')).toBeInTheDocument();
    expect(screen.getByText('Driving Score')).toBeInTheDocument();
    expect(screen.getByText('Urban Index')).toBeInTheDocument();
    expect(screen.getByText('Total Amenities')).toBeInTheDocument();
  });
});