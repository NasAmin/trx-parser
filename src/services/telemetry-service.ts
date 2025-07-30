/* eslint-disable i18n-text/no-en */
import * as core from '@actions/core'
import {NodeSDK} from '@opentelemetry/sdk-node'
import {getNodeAutoInstrumentations} from '@opentelemetry/auto-instrumentations-node'
import {OTLPMetricExporter} from '@opentelemetry/exporter-metrics-otlp-http'
import {OTLPTraceExporter} from '@opentelemetry/exporter-trace-otlp-http'
import {PeriodicExportingMetricReader} from '@opentelemetry/sdk-metrics'
import {metrics, trace, SpanStatusCode} from '@opentelemetry/api'

import {
  TelemetryConfig,
  getTelemetryConfig,
  validateTelemetryConfig
} from '../config/telemetry-config'

let telemetryInitialized = false
let telemetryConfig: TelemetryConfig | null = null
let sdk: NodeSDK | null = null

/**
 * Initialize OpenTelemetry with Honeycomb configuration
 * Telemetry is automatically enabled for vendor repositories only
 */
export function initializeTelemetry(): boolean {
  try {
    telemetryConfig = getTelemetryConfig()

    if (!validateTelemetryConfig(telemetryConfig)) {
      // Only log telemetry info in vendor environment to avoid confusing consumers
      const repository = process.env.GITHUB_REPOSITORY
      if (repository === 'NasAmin/trx-parser') {
        core.info(
          'Vendor telemetry validation failed, telemetry will be disabled'
        )
      }
      return false
    }

    if (!telemetryConfig.enabled) {
      // Only log telemetry info in vendor environment
      const repository = process.env.GITHUB_REPOSITORY
      if (repository === 'NasAmin/trx-parser') {
        core.info('Vendor telemetry is disabled or not available')
      }
      return false
    }

    core.info('Vendor telemetry: Initializing telemetry with Honeycomb')

    // Create OTLP exporters for Honeycomb
    const traceExporter = new OTLPTraceExporter({
      url: `${telemetryConfig.honeycombEndpoint}/v1/traces`,
      headers: {
        'x-honeycomb-team': telemetryConfig.honeycombApiKey || '',
        'x-honeycomb-dataset': telemetryConfig.honeycombDataset || ''
      }
    })

    const metricExporter = new OTLPMetricExporter({
      url: `${telemetryConfig.honeycombEndpoint}/v1/metrics`,
      headers: {
        'x-honeycomb-team': telemetryConfig.honeycombApiKey || '',
        'x-honeycomb-dataset': telemetryConfig.honeycombDataset || ''
      }
    })

    // Initialize the SDK
    sdk = new NodeSDK({
      traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 10000 // Export every 10 seconds
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          // Disable some instrumentations that aren't relevant for GitHub Actions
          '@opentelemetry/instrumentation-fs': {enabled: false}
        })
      ]
    })

    sdk.start()
    telemetryInitialized = true

    core.info('Vendor telemetry: Telemetry initialized successfully')
    return true
  } catch (error) {
    // Only log vendor telemetry errors in vendor environment
    const repository = process.env.GITHUB_REPOSITORY
    if (repository === 'NasAmin/trx-parser') {
      core.warning(
        `Vendor telemetry: Failed to initialize telemetry: ${(error as Error).message}`
      )
    }
    return false
  }
}

/**
 * Shutdown telemetry gracefully
 */
export async function shutdownTelemetry(): Promise<void> {
  if (sdk && telemetryInitialized) {
    try {
      // Only log vendor telemetry info in vendor environment
      const repository = process.env.GITHUB_REPOSITORY
      if (repository === 'NasAmin/trx-parser') {
        core.info('Vendor telemetry: Shutting down telemetry')
      }
      await sdk.shutdown()
      telemetryInitialized = false
    } catch (error) {
      // Only log vendor telemetry errors in vendor environment
      const repository = process.env.GITHUB_REPOSITORY
      if (repository === 'NasAmin/trx-parser') {
        core.warning(
          `Vendor telemetry: Failed to shutdown telemetry: ${(error as Error).message}`
        )
      }
    }
  }
}

/**
 * Get the tracer instance
 */
export function getTracer(): ReturnType<typeof trace.getTracer> {
  return trace.getTracer('trx-parser', telemetryConfig?.serviceVersion)
}

/**
 * Get the meter instance
 */
export function getMeter(): ReturnType<typeof metrics.getMeter> {
  return metrics.getMeter('trx-parser', telemetryConfig?.serviceVersion)
}

/**
 * Check if telemetry is enabled and initialized
 */
export function isTelemetryEnabled(): boolean {
  return telemetryInitialized && telemetryConfig?.enabled === true
}

/**
 * Create a span and execute a function within its context
 */
export async function withSpan<T>(
  name: string,
  fn: () => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  if (!isTelemetryEnabled()) {
    return fn()
  }

  const tracer = getTracer()
  return tracer.startActiveSpan(name, {attributes}, async span => {
    try {
      const result = await fn()
      span.setStatus({code: SpanStatusCode.OK})
      return result
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as Error).message
      })
      span.recordException(error as Error)
      throw error
    } finally {
      span.end()
    }
  })
}

/**
 * Record a metric value
 */
export function recordMetric(
  name: string,
  value: number,
  attributes?: Record<string, string | number | boolean>
): void {
  if (!isTelemetryEnabled()) {
    return
  }

  try {
    const meter = getMeter()
    const counter = meter.createCounter(name)
    counter.add(value, attributes)
  } catch (error) {
    core.warning(`Failed to record metric ${name}: ${(error as Error).message}`)
  }
}

/**
 * Record action run outcome
 */
export function recordActionOutcome(
  outcome: 'success' | 'failure',
  attributes?: Record<string, string | number | boolean>
): void {
  recordMetric('trx_parser_action_runs_total', 1, {
    outcome,
    ...attributes
  })
}

/**
 * Record test results metrics
 */
export function recordTestResults(
  totalTests: number,
  passedTests: number,
  failedTests: number,
  attributes?: Record<string, string | number | boolean>
): void {
  if (!isTelemetryEnabled()) {
    return
  }

  recordMetric('trx_parser_tests_total', totalTests, attributes)
  recordMetric('trx_parser_tests_passed', passedTests, attributes)
  recordMetric('trx_parser_tests_failed', failedTests, attributes)
}

/**
 * Record TRX file processing metrics
 */
export function recordTrxFileProcessing(
  fileCount: number,
  attributes?: Record<string, string | number | boolean>
): void {
  recordMetric('trx_parser_files_processed_total', fileCount, attributes)
}
