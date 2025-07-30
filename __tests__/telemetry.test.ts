import {getTelemetryConfig, validateTelemetryConfig} from '../src/config/telemetry-config'
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
    delete process.env.OTEL_ENABLED
    delete process.env.HONEYCOMB_API_KEY
    delete process.env.HONEYCOMB_DATASET
  })

  it('should return disabled config when OTEL_ENABLED is not set', () => {
    const config = getTelemetryConfig()
    expect(config.enabled).toBe(false)
  })

  it('should return enabled config when OTEL_ENABLED is true', () => {
    process.env.OTEL_ENABLED = 'true'
    process.env.HONEYCOMB_API_KEY = 'test-key'
    
    const config = getTelemetryConfig()
    expect(config.enabled).toBe(true)
    expect(config.honeycombApiKey).toBe('test-key')
    expect(config.honeycombDataset).toBe('trx-parser')
  })

  it('should use custom dataset when provided', () => {
    process.env.OTEL_ENABLED = 'true'
    process.env.HONEYCOMB_DATASET = 'custom-dataset'
    
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
    delete process.env.OTEL_ENABLED
    delete process.env.HONEYCOMB_API_KEY
    delete process.env.HONEYCOMB_DATASET
  })

  afterEach(async () => {
    await shutdownTelemetry()
  })

  it('should not initialize when telemetry is disabled', () => {
    const result = initializeTelemetry()
    expect(result).toBe(false)
    expect(isTelemetryEnabled()).toBe(false)
  })

  it('should not initialize when enabled but no API key', () => {
    process.env.OTEL_ENABLED = 'true'
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
})