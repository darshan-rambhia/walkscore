import { onCLS, onFID, onLCP, onINP, onFCP, onTTFB, type Metric } from 'web-vitals';
import { logger } from './utils/logger.ts';

/**
 * Initialize Web Vitals collection. Results are logged and sent via beacon
 * (if available) to Vercel Speed Insights automatically by their injected script.
 * This module provides an additional custom hook point should we later decide
 * to POST to our own analytics endpoint.
 */
export function initWebVitals() {
  const log = logger.child('perf:vitals');

  function report(metric: Metric) {
    // Log structured metric
    log.info('metric', {
      name: metric.name,
      id: metric.id,
      value: metric.value,
      rating: (metric as any).rating,
      delta: metric.delta,
      navigationType: (metric as any).navigationType
    });

    // Example: custom beacon (disabled by default)
    // if (navigator.sendBeacon) {
    //   const body = JSON.stringify(metric);
    //   navigator.sendBeacon('/analytics', body);
    // }
  }

  onCLS(report);
  onFID(report);
  onLCP(report);
  onINP(report);
  onFCP(report);
  onTTFB(report);
}
