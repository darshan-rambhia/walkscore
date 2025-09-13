import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geocodeAddress, fetchAmenities, buildAmenityRegex, needsAmenitiesFetch } from '../../services/location';

// Mock fetch
globalThis.fetch = vi.fn();

describe('location service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should return geocode result for valid address', async () => {
      const mockResponse = [{
        display_name: 'New York, NY, USA',
        lat: '40.7128',
        lon: '-74.0060'
      }];

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await geocodeAddress('New York');

      expect(result).toEqual({
        displayName: 'New York, NY, USA',
        lat: 40.7128,
        lon: -74.0060
      });
    });

    it('should return null for failed request', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
      });

      const result = await geocodeAddress('Invalid Address');
      expect(result).toBeNull();
    });

    it('should return null for empty response', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const result = await geocodeAddress('No Results');
      expect(result).toBeNull();
    });

    it('should handle network errors', async () => {
      (globalThis.fetch as any).mockRejectedValueOnce(
        new Error("Network error")
      );

      await expect(geocodeAddress('Test Address')).rejects.toThrow('Network error');
    });
  });

  describe('fetchAmenities', () => {
    it('should return amenities from successful API call', async () => {
      const mockOverpassResponse = {
        elements: [
          {
            id: 1,
            type: 'node',
            lat: 40.7580,
            lon: -73.9855,
            tags: {
              amenity: 'restaurant',
              name: 'Test Restaurant'
            }
          },
          {
            id: 2,
            type: 'way',
            center: { lat: 40.7590, lon: -73.9865 },
            tags: {
              amenity: 'cafe',
              name: 'Test Cafe'
            }
          }
        ]
      };

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOverpassResponse)
      });

      const result = await fetchAmenities(40.7580, -73.9855);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: '1',
        name: 'Test Restaurant',
        type: 'restaurant',
        lat: 40.7580,
        lon: -73.9855
      });
      expect(result[1]).toMatchObject({
        id: '2',
        name: 'Test Cafe',
        type: 'cafe',
        lat: 40.7590,
        lon: -73.9865
      });
    });

    it('should filter out amenities without coordinates', async () => {
      const mockOverpassResponse = {
        elements: [
          {
            id: 1,
            type: 'node',
            lat: 40.7580,
            lon: -73.9855,
            tags: { amenity: 'restaurant', name: 'Valid Restaurant' }
          },
          {
            id: 2,
            type: 'way',
            tags: { amenity: 'cafe', name: 'Invalid Cafe' }
          }
        ]
      };

      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockOverpassResponse),
      });

      const result = await fetchAmenities(40.7580, -73.9855);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Valid Restaurant');
    });

    it('should return empty array on API failure', async () => {
      (globalThis.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await fetchAmenities(40.7580, -73.9855);
      expect(result).toEqual([]);
    });
  });

  describe('buildAmenityRegex', () => {
    it('should build regex pattern from amenity list', () => {
      const amenities = ['restaurant', 'cafe', 'bar'];
      const result = buildAmenityRegex(amenities);
      
      expect(result).toBe('^(restaurant|cafe|bar)$');
    });

    it('should escape special regex characters', () => {
      const amenities = ['fast_food', 'ice-cream'];
      const result = buildAmenityRegex(amenities);
      
      expect(result).toBe('^(fast_food|ice\\-cream)$');
    });

    it('should handle empty array', () => {
      const result = buildAmenityRegex([]);
      expect(result).toBe('^()$');
    });
  });

  describe('needsAmenitiesFetch', () => {
    it('should return false if no coordinates', () => {
      const result = needsAmenitiesFetch({});
      expect(result).toBe(false);
    });

    it('should return false if has amenities and scores', () => {
      const result = needsAmenitiesFetch({
        coords: { lat: 40.7580, lon: -73.9855 },
        amenities: [{ id: '1', name: 'Test', type: 'restaurant', lat: 40.7580, lon: -73.9855, distance: 100 }],
        scores: { walkingScore: 50 }
      });
      expect(result).toBe(false);
    });

    it('should return true if has coordinates but no amenities', () => {
      const result = needsAmenitiesFetch({
        coords: { lat: 40.7580, lon: -73.9855 },
        amenities: [],
        scores: null
      });
      expect(result).toBe(true);
    });

    it('should return true if has coordinates but no scores', () => {
      const result = needsAmenitiesFetch({
        coords: { lat: 40.7580, lon: -73.9855 },
        amenities: [{ id: '1', name: 'Test', type: 'restaurant', lat: 40.7580, lon: -73.9855, distance: 100 }],
        scores: null
      });
      expect(result).toBe(true);
    });
  });
});