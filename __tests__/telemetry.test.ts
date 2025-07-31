import {
  getTelemetryConfig,
  validateTelemetryConfig
} from '../src/config/telemetry-config'
import {
  initializeTelemetry,
  shutdownTelemetry,
  isTelemetryEnabled,
  recordActionOutcome,
  recordTestResults,
  recordTrxFileProcessing
} from '../src/services/telemetry-service'

describe('Telemetry Configuration', () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.GITHUB_REPOSITORY
    delete process.env.VENDOR_HONEYCOMB_API_KEY
    delete process.env.VENDOR_HONEYCOMB_DATASET
  })

  it('should return disabled config when not in vendor environment', () => {
    process.env.GITHUB_REPOSITORY = 'some-user/some-repo'
    const config = getTelemetryConfig()
    expect(config.enabled).toBe(false)
  })

  it('should return disabled config when in vendor environment but no API key', () => {
    process.env.GITHUB_REPOSITORY = 'NasAmin/trx-parser'
    const config = getTelemetryConfig()
    expect(config.enabled).toBe(false)
  })

  it('should return enabled config when in vendor environment with API key', () => {
    process.env.GITHUB_REPOSITORY = 'NasAmin/trx-parser'
    process.env.VENDOR_HONEYCOMB_API_KEY = 'vendor-test-key'

    const config = getTelemetryConfig()
    expect(config.enabled).toBe(true)
    expect(config.honeycombApiKey).toBe('vendor-test-key')
    expect(config.honeycombDataset).toBe('trx-parser')
  })

  it('should use custom dataset when provided in vendor environment', () => {
    process.env.GITHUB_REPOSITORY = 'NasAmin/trx-parser'
    process.env.VENDOR_HONEYCOMB_API_KEY = 'vendor-test-key'
    process.env.VENDOR_HONEYCOMB_DATASET = 'custom-dataset'

    const config = getTelemetryConfig()
    expect(config.honeycombDataset).toBe('custom-dataset')
  })

  it('should validate config as true when disabled', () => {
    const config = getTelemetryConfig()
    expect(validateTelemetryConfig(config)).toBe(true)
  })

  it('should validate config as false when enabled but no API key', () => {
    const config = {
      enabled: true,
      honeycombApiKey: undefined,
      honeycombDataset: 'test',
      honeycombEndpoint: 'https://api.honeycomb.io',
      serviceName: 'trx-parser',
      serviceVersion: '0.0.0'
    }
    expect(validateTelemetryConfig(config)).toBe(false)
  })

  it('should validate config as true when enabled with API key', () => {
    const config = {
      enabled: true,
      honeycombApiKey: 'test-key',
      honeycombDataset: 'test',
      honeycombEndpoint: 'https://api.honeycomb.io',
      serviceName: 'trx-parser',
      serviceVersion: '0.0.0'
    }
    expect(validateTelemetryConfig(config)).toBe(true)
  })
})

describe('Telemetry Service', () => {
  beforeEach(() => {
    // Clear environment variables
    delete process.env.GITHUB_REPOSITORY
    delete process.env.VENDOR_HONEYCOMB_API_KEY
    delete process.env.VENDOR_HONEYCOMB_DATASET
  })

  afterEach(async () => {
    await shutdownTelemetry()
  })

  it('should not initialize when not in vendor environment', () => {
    process.env.GITHUB_REPOSITORY = 'some-user/some-repo'
    const result = initializeTelemetry()
    expect(result).toBe(false)
    expect(isTelemetryEnabled()).toBe(false)
  })

  it('should not initialize when in vendor environment but no API key', () => {
    process.env.GITHUB_REPOSITORY = 'NasAmin/trx-parser'
    const result = initializeTelemetry()
    expect(result).toBe(false)
    expect(isTelemetryEnabled()).toBe(false)
  })

  it('should record metrics gracefully when telemetry is disabled', () => {
    expect(() => {
      recordActionOutcome('success')
      recordTestResults(10, 8, 2)
      recordTrxFileProcessing(3)
    }).not.toThrow()
  })

  it('should shutdown gracefully when not initialized', async () => {
    await expect(shutdownTelemetry()).resolves.not.toThrow()
  })

  it('should set OpenTelemetry environment variables when initializing with valid config', () => {
    process.env.GITHUB_REPOSITORY = 'NasAmin/trx-parser'
    process.env.VENDOR_HONEYCOMB_API_KEY = 'test-api-key'
    
    // Clear any existing OTEL env vars
    delete process.env.OTEL_SERVICE_NAME
    delete process.env.OTEL_EXPORTER_OTLP_PROTOCOL
    delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT
    delete process.env.OTEL_EXPORTER_OTLP_HEADERS

    const result = initializeTelemetry()
    expect(result).toBe(true)
    
    // Verify that the OpenTelemetry environment variables are set
    expect(process.env.OTEL_SERVICE_NAME).toBe('trx-parser')
    expect(process.env.OTEL_EXPORTER_OTLP_PROTOCOL).toBe('http/protobuf')
    expect(process.env.OTEL_EXPORTER_OTLP_ENDPOINT).toBe('https://api.honeycomb.io')
    expect(process.env.OTEL_EXPORTER_OTLP_HEADERS).toBe('x-honeycomb-team=test-api-key')
  })
})
