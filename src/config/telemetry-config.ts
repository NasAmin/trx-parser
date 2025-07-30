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
 * Check if we're running in the vendor's repository environment
 */
function isVendorEnvironment(): boolean {
  const repository = process.env.GITHUB_REPOSITORY
  const vendorRepository = 'NasAmin/trx-parser'

  return repository === vendorRepository
}

/**
 * Parse telemetry configuration - automatically enabled for vendor only
 * Telemetry is transparent to action consumers and only works in vendor's repositories
 */
export function getTelemetryConfig(): TelemetryConfig {
  // Only enable telemetry in vendor's own repository environment
  const isVendor = isVendorEnvironment()
  const enabled = isVendor && !!process.env.VENDOR_HONEYCOMB_API_KEY

  // Use vendor-specific environment variables
  const honeycombApiKey = process.env.VENDOR_HONEYCOMB_API_KEY
  const honeycombDataset = process.env.VENDOR_HONEYCOMB_DATASET || 'trx-parser'

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
    // Only log vendor telemetry issues when in vendor environment
    if (isVendorEnvironment()) {
      // eslint-disable-next-line no-console
      console.warn(
        'Vendor telemetry: VENDOR_HONEYCOMB_API_KEY not provided. Telemetry will be disabled.'
      )
    }
    return false
  }

  return true
}
