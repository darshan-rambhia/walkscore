import { describe, it, expect } from 'vitest';
import { buildShareUrl, parseSharedParams } from '../../../src/services/share';

describe('share service', () => {
  it('buildShareUrl should include trimmed fixed precision coords', () => {
    const url = buildShareUrl('https://example.com/app', { lat: 40.7580123, lon: -73.9855123 }, 'Times Square');
    expect(url.startsWith('https://example.com/')).toBe(true);
    expect(url).toContain('lat=40.758012');
    expect(url).toContain('lon=-73.985512');
    // Space may be encoded as + by URLSearchParams; accept either representation
    expect(/label=Times(\+|%20)Square/.test(url)).toBe(true);
  });

  it('parseSharedParams should parse valid params', () => {
    const parsed = parseSharedParams('?lat=40.758000&lon=-73.985500&label=Test');
    expect(parsed).toEqual({ lat: 40.758, lon: -73.9855, label: 'Test' });
  });

  it('parseSharedParams returns null for invalid numbers', () => {
    expect(parseSharedParams('?lat=abc&lon=123')).toBeNull();
  });

  it('parseSharedParams returns null when missing coords', () => {
    expect(parseSharedParams('?label=Only')).toBeNull();
  });

  it('round trip build -> parse', () => {
    const built = buildShareUrl('https://site.com', { lat: 12.3456789, lon: -9.87654321 }, 'Label Here');
    const q = built.substring(built.indexOf('?'));
    const parsed = parseSharedParams(q);
    expect(parsed?.lat).toBeCloseTo(12.345679);
    expect(parsed?.lon).toBeCloseTo(-9.876543);
    expect(parsed?.label).toBe('Label Here');
  });
});
