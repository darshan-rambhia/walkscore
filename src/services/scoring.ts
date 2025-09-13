import type { Amenity } from './location.ts';

export interface ScoreBreakdown {
  walkingScore: number;
  drivingScore: number;
  urbanSuburbanIndex: number;
  totalAmenities: number;
}

export function computeScores(amenities: Amenity[]): ScoreBreakdown {
  const walkingRadius = 800; // ~0.5 miles
  const drivingRadius = 3200; // ~2 miles
  
  // Count amenities within walking distance
  const walkableAmenities = amenities.filter(a => a.distance <= walkingRadius);
  const drivableAmenities = amenities.filter(a => a.distance <= drivingRadius);
  
  // Calculate walking score (0-100)
  const walkingScore = Math.min(100, Math.round((walkableAmenities.length / 20) * 100));
  
  // Calculate driving score (0-100) 
  const drivingScore = Math.min(100, Math.round((drivableAmenities.length / 50) * 100));
  
  // Urban/Suburban index based on density
  const density = amenities.length / Math.PI; // amenities per sq km (rough)
  const urbanSuburbanIndex = density > 15 ? 
    Math.min(100, Math.round(density * 2)) : // Urban
    Math.max(20, Math.round(density * 3)); // Suburban
  
  return {
    walkingScore,
    drivingScore,
    urbanSuburbanIndex,
    totalAmenities: amenities.length
  };
}