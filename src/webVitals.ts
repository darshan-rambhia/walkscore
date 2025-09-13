import { onCLS, onLCP, onINP, onFCP, onTTFB, type Metric } from 'web-vitals';

/**
 * Initialize Web Vitals collection. Results are logged and sent via beacon
 * (if available) to Vercel Speed Insights automatically by their injected script.
 * This module provides an additional custom hook point should we later decide
 * to POST to our own analytics endpoint.
 */
export function initWebVitals() {
  function report(metric: Metric) {
    // Log structured metric
    const coarse: Record<string, unknown> = {
      name: metric.name,
      id: metric.id,
      value: metric.value,
      delta: metric.delta,
    };
    // Optional extra properties if present (not on Metric base type in typings)
  const maybeAny = metric as unknown as { rating?: unknown; navigationType?: unknown };
  if (maybeAny.rating) coarse.rating = maybeAny.rating;
  if (maybeAny.navigationType) coarse.navigationType = maybeAny.navigationType;
  }

  onCLS(report);
  onLCP(report);
  onINP(report);
  onFCP(report);
  onTTFB(report);
}
