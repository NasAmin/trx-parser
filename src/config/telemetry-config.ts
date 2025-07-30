/**
 * Telemetry configuration for OpenTelemetry integration with Honeycomb
 */

export interface TelemetryConfig {
  enabled: boolean
  honeycombApiKey?: string
  honeycombDataset?: string
  honeycombEndpoint: string
  serviceName: string
  serviceVersion: string
}

/**
 * Parse telemetry configuration from environment variables
 */
export function getTelemetryConfig(): TelemetryConfig {
  const enabled = process.env.OTEL_ENABLED === 'true'
  const honeycombApiKey = process.env.HONEYCOMB_API_KEY
  const honeycombDataset = process.env.HONEYCOMB_DATASET || 'trx-parser'

  return {
    enabled,
    honeycombApiKey,
    honeycombDataset,
    honeycombEndpoint: 'https://api.honeycomb.io',
    serviceName: 'trx-parser',
    serviceVersion: process.env.npm_package_version || '0.0.0'
  }
}

/**
 * Validate telemetry configuration
 */
export function validateTelemetryConfig(config: TelemetryConfig): boolean {
  if (!config.enabled) {
    return true // Valid to have telemetry disabled
  }

  if (!config.honeycombApiKey) {
    // eslint-disable-next-line no-console
    console.warn(
      'Telemetry enabled but HONEYCOMB_API_KEY not provided. Telemetry will be disabled.'
    )
    return false
  }

  return true
}
