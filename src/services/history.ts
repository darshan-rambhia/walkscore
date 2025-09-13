export interface HistoryEntry {
  query: string;
  displayName: string;
  coords: { lat: number; lon: number };
  timestamp: number;
}

const STORAGE_KEY = 'walkscore-history';
const MAX_ENTRIES = 10;

export function getHistory(): HistoryEntry[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: HistoryEntry): void {
  try {
    const history = getHistory();
    
    // Remove duplicate if exists
    const filtered = history.filter(h => 
      h.coords.lat !== entry.coords.lat || h.coords.lon !== entry.coords.lon
    );
    
    // Add new entry at beginning
    filtered.unshift(entry);
    
    // Keep only MAX_ENTRIES
    const trimmed = filtered.slice(0, MAX_ENTRIES);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.warn('Failed to save history entry:', error);
  }
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear history:', error);
  }
}