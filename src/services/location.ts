import { logger } from '../utils/logger.ts';

export interface GeocodeResult {
  displayName: string;
  lat: number;
  lon: number;
}

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
    query
  )}&limit=1&addressdetails=0`;
  const res = await fetch(url, {
    headers: { "Accept-Language": "en", "User-Agent": "walkscore-demo" },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data.length) return null;
  return {
    displayName: data[0].display_name,
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
  };
}

export interface Amenity {
  id: string;
  name?: string;
  type: string;
  lat: number;
  lon: number;
  distance: number;
}

export const ONE_MILE_METERS = 1609.34;

export const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.openstreetmap.ru/cgi/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

interface RawAmenity {
  id: number;
  tags?: Record<string, string>;
  lat?: number;
  lon?: number;
  type: string;
  center?: { lat: number; lon: number };
}

export async function fetchAmenities(
  lat: number,
  lon: number,
  radiusMeters = ONE_MILE_METERS
): Promise<Amenity[]> {
  const log = logger.child('services:location');
  log.debug('fetchAmenities invoked', { lat, lon, radiusMeters });
  
  const amenities = [
    "restaurant", "cafe", "bar", "pub", "school", "supermarket",
    "pharmacy", "park", "bank", "bus_station", "fast_food",
  ];
  
  const filterPattern = buildAmenityRegex(amenities);
  
  async function runQuery(r: number, pattern: string): Promise<Amenity[]> {
    const radiusRounded = Math.round(r);
    const query = `[out:json][timeout:25];(
        node["amenity"~"${pattern}"](around:${radiusRounded},${lat},${lon});
        way["amenity"~"${pattern}"](around:${radiusRounded},${lat},${lon});
        relation["amenity"~"${pattern}"](around:${radiusRounded},${lat},${lon});
      );out center 80;`;
    
    for (const ep of OVERPASS_ENDPOINTS) {
      const list = await attemptEndpoint(ep, query, lat, lon);
      if (list.length) {
        return list;
      }
    }
    return [];
  }

  async function attemptEndpoint(ep: string, query: string, lat: number, lon: number): Promise<Amenity[]> {
    try {
      const res = await fetch(ep, {
        method: "POST",
        body: query,
        headers: {
          "User-Agent": "walkscore-demo",
          "Accept": "application/json",
          "Content-Type": "text/plain;charset=UTF-8",
        },
      });
      if (!res.ok) {
        log.warn('endpoint failure', { endpoint: ep, status: res.status });
        return [];
      }
      const data = await res.json();
      return ((data.elements || []) as RawAmenity[])
        .map((amenity) => {
          const aLat = amenity.lat ?? amenity.center?.lat;
          const aLon = amenity.lon ?? amenity.center?.lon;
          if (aLat == null || aLon == null) return null;
          return {
            id: String(amenity.id),
            name: amenity.tags?.name,
            type: amenity.tags?.amenity || "amenity",
            lat: aLat,
            lon: aLon,
            distance: haversineMeters(lat, lon, aLat, aLon),
          } as Amenity;
        })
        .filter(Boolean) as Amenity[];
    } catch (err) {
      log.error('endpoint error', { endpoint: ep, error: (err as any)?.message || err });
      return [];
    }
  }

  let results = await runQuery(radiusMeters, filterPattern);
  if (results.length === 0) {
    results = await runQuery(radiusMeters * 2, filterPattern);
  }
  if (results.length === 0) {
    const broader = buildAmenityRegex([
      ...amenities, "library", "hospital", "theatre", "cinema", "university",
    ]);
    results = await runQuery(radiusMeters * 2, broader);
  }
  if (results.length === 0) {
    const relaxed = amenities.join("|");
    results = await runQuery(radiusMeters * 2, relaxed);
  }
  return results;
}

function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of earth in meters. Use 3956 for miles
  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const lat1InRadians = toRadians(lat1);
  const lat2InRadians = toRadians(lat2);
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1InRadians) * Math.cos(lat2InRadians) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function buildAmenityRegex(list: string[]): string {
  return `^(${list
    .map((v) => v.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"))
    .join("|")})$`;
}

export function needsAmenitiesFetch(params: {
  amenities?: Amenity[] | null;
  scores?: unknown;
  coords?: { lat: number; lon: number } | null;
}): boolean {
  if (!params?.coords) return false;
  const hasAmenities = !!params.amenities?.length;
  const hasScores = params.scores != null;
  return !(hasAmenities && hasScores);
}