import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getHistory, addHistoryEntry, clearHistory } from '../../services/history';
import type { HistoryEntry } from '../../services/history';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

describe('history service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHistory', () => {
    it('should return parsed history from localStorage', () => {
      const mockHistory: HistoryEntry[] = [
        {
          query: 'New York',
          displayName: 'New York, NY, USA',
          coords: { lat: 40.7128, lon: -74.0060 },
          timestamp: 1234567890
        }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockHistory));

      const result = getHistory();
      
      expect(localStorageMock.getItem).toHaveBeenCalledWith('walkscore-history');
      expect(result).toEqual(mockHistory);
    });

    it('should return empty array if no stored history', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = getHistory();
      
      expect(result).toEqual([]);
    });

    it('should return empty array if JSON parsing fails', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      const result = getHistory();
      
      expect(result).toEqual([]);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const result = getHistory();
      
      expect(result).toEqual([]);
    });
  });

  describe('addHistoryEntry', () => {
    const mockEntry: HistoryEntry = {
      query: 'Boston',
      displayName: 'Boston, MA, USA',
      coords: { lat: 42.3601, lon: -71.0589 },
      timestamp: 1234567890
    };

    it('should add new entry to empty history', () => {
      localStorageMock.getItem.mockReturnValue(null);

      addHistoryEntry(mockEntry);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'walkscore-history',
        JSON.stringify([mockEntry])
      );
    });

    it('should add new entry at the beginning of existing history', () => {
      const existingHistory: HistoryEntry[] = [
        {
          query: 'New York',
          displayName: 'New York, NY, USA',
          coords: { lat: 40.7128, lon: -74.0060 },
          timestamp: 1234567800
        }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));

      addHistoryEntry(mockEntry);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'walkscore-history',
        JSON.stringify([mockEntry, existingHistory[0]])
      );
    });

    it('should remove duplicate entry before adding new one', () => {
      const existingHistory: HistoryEntry[] = [
        {
          query: 'Old Boston Search',
          displayName: 'Boston, MA, USA',
          coords: { lat: 42.3601, lon: -71.0589 },
          timestamp: 1234567800
        },
        {
          query: 'New York',
          displayName: 'New York, NY, USA',
          coords: { lat: 40.7128, lon: -74.0060 },
          timestamp: 1234567700
        }
      ];

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));

      addHistoryEntry(mockEntry);

      const expectedHistory = [mockEntry, existingHistory[1]];
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'walkscore-history',
        JSON.stringify(expectedHistory)
      );
    });

    it('should limit history to MAX_ENTRIES (10)', () => {
      const existingHistory: HistoryEntry[] = Array.from({ length: 10 }, (_, i) => ({
        query: `Query ${i}`,
        displayName: `Place ${i}`,
        coords: { lat: i, lon: i },
        timestamp: 1234567890 + i
      }));

      localStorageMock.getItem.mockReturnValue(JSON.stringify(existingHistory));

      addHistoryEntry(mockEntry);

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'walkscore-history',
        expect.any(String)
      );

      const savedHistory = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(savedHistory).toHaveLength(10);
      expect(savedHistory[0]).toEqual(mockEntry);
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => addHistoryEntry(mockEntry)).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save history entry:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('clearHistory', () => {
    it('should remove history from localStorage', () => {
      clearHistory();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('walkscore-history');
    });

    it('should handle localStorage errors gracefully', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      expect(() => clearHistory()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to clear history:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });
});