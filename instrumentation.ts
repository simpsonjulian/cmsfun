import { registerOTel } from '@vercel/otel';

/**
 * OpenTelemetry registration. Next.js calls `register()` once per server
 * runtime at startup.
 *
 * Traces go to Vercel's OpenTelemetry collector, which forwards them to
 * whichever observability integrations are installed on the project — for
 * New Relic that means enabling "Traces (Beta)" on the integration. No
 * OTEL_EXPORTER_* variables are needed: the collector owns the export.
 */
export function register(): void {
  registerOTel({ serviceName: 'cmsfun' });
}
