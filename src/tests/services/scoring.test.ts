import { describe, it, expect } from 'vitest';
import { computeScores } from '../../services/scoring';
import type { Amenity } from '../../services/location';

describe('scoring service', () => {
  const mockAmenities: Amenity[] = [
    { id: '1', name: 'Coffee Shop', type: 'cafe', lat: 40.7580, lon: -73.9855, distance: 500 },
    { id: '2', name: 'Restaurant', type: 'restaurant', lat: 40.7590, lon: -73.9865, distance: 750 },
    { id: '3', name: 'Supermarket', type: 'supermarket', lat: 40.7600, lon: -73.9875, distance: 1200 },
    { id: '4', name: 'Park', type: 'park', lat: 40.7610, lon: -73.9885, distance: 2000 },
    { id: '5', name: 'Bank', type: 'bank', lat: 40.7620, lon: -73.9895, distance: 2500 },
  ];

  describe('computeScores', () => {
    it('should calculate walking score based on walkable amenities', () => {
      const result = computeScores(mockAmenities);
      
      // walkableAmenities (distance <= 800): Coffee Shop, Restaurant = 2
      // walkingScore = min(100, round((2/20) * 100)) = 10
      expect(result.walkingScore).toBe(10);
    });

    it('should calculate driving score based on drivable amenities', () => {
      const result = computeScores(mockAmenities);
      
      // drivableAmenities (distance <= 3200): all 5 amenities
      // drivingScore = min(100, round((5/50) * 100)) = 10
      expect(result.drivingScore).toBe(10);
    });

    it('should calculate urban/suburban index based on density', () => {
      const result = computeScores(mockAmenities);
      
      // density = 5 / π ≈ 1.59
      // Since density < 15, suburban: max(20, round(1.59 * 3)) = max(20, 5) = 20
      expect(result.urbanSuburbanIndex).toBe(20);
    });

    it('should return total amenities count', () => {
      const result = computeScores(mockAmenities);
      expect(result.totalAmenities).toBe(5);
    });

    it('should handle empty amenities array', () => {
      const result = computeScores([]);
      
      expect(result.walkingScore).toBe(0);
      expect(result.drivingScore).toBe(0);
      expect(result.urbanSuburbanIndex).toBe(20);
      expect(result.totalAmenities).toBe(0);
    });

    it('should cap walking score at 100', () => {
      const manyAmenities: Amenity[] = Array.from({ length: 25 }, (_, i) => ({
        id: String(i),
        name: `Amenity ${i}`,
        type: 'restaurant',
        lat: 40.7580,
        lon: -73.9855,
        distance: 500, // All within walking distance
      }));

      const result = computeScores(manyAmenities);
      expect(result.walkingScore).toBe(100);
    });

    it('should cap driving score at 100', () => {
      const manyAmenities: Amenity[] = Array.from({ length: 60 }, (_, i) => ({
        id: String(i),
        name: `Amenity ${i}`,
        type: 'restaurant',
        lat: 40.7580,
        lon: -73.9855,
        distance: 2000, // All within driving distance
      }));

      const result = computeScores(manyAmenities);
      expect(result.drivingScore).toBe(100);
    });

    it('should classify high density as urban', () => {
      const manyAmenities: Amenity[] = Array.from({ length: 50 }, (_, i) => ({
        id: String(i),
        name: `Amenity ${i}`,
        type: 'restaurant',
        lat: 40.7580,
        lon: -73.9855,
        distance: 1000,
      }));

      const result = computeScores(manyAmenities);
      
      // density = 50 / π ≈ 15.9 (> 15, so urban)
      // urbanSuburbanIndex = min(100, round(15.9 * 2)) = min(100, 32) = 32
      expect(result.urbanSuburbanIndex).toBe(32);
    });
  });
});