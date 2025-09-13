# WalkScore

Live site: <https://walkscore.vercel.app>
Lightweight, client-only walkability explorer built with open geodata. Enter an address, view nearby amenities, heuristic walking & driving scores, and an Urban / Mixed / Suburban classification.

## Data Sources

- Geocoding: Nominatim (OpenStreetMap)
- Amenities: Overpass API
- Mapping: Leaflet (react-leaflet)

## Features

- Address search pipeline (geocode → amenities → scores)
- Multi-stage amenity fallback (radius expansion, broadened categories)
- Heuristic scores (Walking, Driving, Urban Index)
- Area type chip + total amenity count
- Local history (dedupe, capped, newest-first)
- Responsive Leaflet map
- Material UI interface
- Structured logging (Pino wrapper with runtime controls)
- Web Vitals + Vercel Speed Insights

## Scoring (Heuristic, 0-100)

- Walking Score: Inverse-distance weighting of amenities within ~0.5 mi
- Driving Score: Count *0.6 + uniqueTypes* 4 (capped)
- Urban Index: Density + diversity (scaled) → label (Urban / Mixed / Suburban)

## Stack

React 19 · TypeScript · Vite · React Router · Leaflet · MUI · Vitest · Pino · web-vitals

## Directory Overview

```plaintext
src/
  components/   AddressSearch, ScoresPanel, MapView, etc.
  pages/        HomePage, InsightsPage
  services/     location.ts (geocode, amenities, regex), scoring.ts, history.ts
  utils/        logger.ts
  webVitals.ts  Web Vitals initialization
  App.tsx
  main.tsx
```

## Data Flow

1. User enters address → `geocodeAddress()`
2. Fetch nearby amenities → `fetchAmenities()` (with fallbacks)
3. Compute scores → `computeScores()`
4. Persist to history + navigate with state
5. Insights page renders scores, map, list

## Local Development

```bash
npm install
npm run dev      # Dev server
npm test         # Tests
npm run build    # Production build
npm run preview  # Preview dist
```

## Logging

Runtime adjustments in DevTools:

```js
window.__WI_LOG.setLevel('debug');
window.__WI_LOG.setFilter(ns => ns.startsWith('services'));
```

## Web Vitals

Collected via Vercel script + `webVitals.ts` (CLS, FID, LCP, INP, FCP, TTFB). Extend by enabling the commented `sendBeacon` snippet.

## Deployment (Vercel)

Key `vercel.json` items:

- Static build (`@vercel/static-build`, output `dist`)
- SPA rewrite → `index.html`
- Long cache for `/assets/*` hashed files
- `index.html` served with `no-cache`

```bash
npm run build
npx vercel --prod
```

## Fallback Behavior

If amenities insufficient:

1. Expand radius (1 mi → 2 mi)
2. Broaden amenity regex list
3. Return empty array (UI shows message)

## History Storage

Key: `wi_history_v1`

- Max 20 entries
- Newest first
- Dedupes identical query + coords

## Accessibility Notes

- Semantic labels for score blocks
- Progress bars with ARIA attributes
- Disabled + loading button state on search

## Potential Enhancements

- Security headers (CSP, Referrer-Policy)
- Dark mode toggle
- Amenity caching (coordinate buckets)
- Marker clustering
- Category weighting matrix
- Offline/IndexedDB cache

## Sharing & Growth

You can generate a shareable permalink for any scored location from the Insights page using the "Copy Share Link" button. The link encodes only coordinates (and optional label) as query params; amenity data & scores are recomputed on load for freshness.

Example format: `https://walkscore.vercel.app/?lat=40.758000&lon=-73.985500&label=Times%20Sq`

Workflow:

1. User opens the link.
2. The app detects `lat`/`lon` params.
3. It geocodes label (if present) or uses raw coords.
4. Fetches amenities + computes scores (same pipeline as normal search).

This keeps URLs stable, minimal, and future‑proof (no versioned score blobs). Potential future extension: include a scoring version `v=1` for backward compatibility after formula changes.

## License

MIT - see [LICENSE](./LICENSE).

---
Built quickly using open data & pragmatic heuristics.
