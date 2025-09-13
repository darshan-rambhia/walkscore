/**
 * Builds a shareable permalink including coordinates and an optional display name.
 * Only encodes minimal state: coordinates & (optionally) a label. Amenity & score data
 * are recomputed on load for freshness.
 */
export function buildShareUrl(base: string, coords: { lat: number; lon: number }, displayName?: string) {
  const url = new URL(base);
  url.pathname = '/insights';
  url.searchParams.set('lat', coords.lat.toFixed(6));
  url.searchParams.set('lon', coords.lon.toFixed(6));
  if (displayName) url.searchParams.set('label', displayName);
  return url.toString();
}

/**
 * Parses coordinates from current location search params.
 */
export function parseSharedParams(locationSearch: string): { lat: number; lon: number; label?: string } | null {
  const params = new URLSearchParams(locationSearch);
  const lat = params.get('lat');
  const lon = params.get('lon');
  if (!lat || !lon) return null;
  const label = params.get('label') || undefined;
  const latNum = Number(lat);
  const lonNum = Number(lon);
  if (Number.isNaN(latNum) || Number.isNaN(lonNum)) return null;
  return { lat: latNum, lon: lonNum, label };
}
