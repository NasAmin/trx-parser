import * as core from '@actions/core'
import * as path from 'path'

/**
 * Validate required inputs for the action
 */
export interface ActionInputs {
  token: string
  trxPath: string
  ignoreTestFailures: boolean
  sha?: string
  reportPrefix?: string
}

/**
 * Sanitize and validate file path to prevent directory traversal
 */
function sanitizePath(inputPath: string): string {
  if (!inputPath || typeof inputPath !== 'string') {
    throw new Error('Invalid path provided')
  }

  // Remove null bytes and other dangerous characters
  const sanitized = inputPath.replace(/\0/g, '').trim()

  if (sanitized !== inputPath) {
    throw new Error('Path contains invalid characters')
  }

  // Resolve and normalize the path
  const resolved = path.resolve(sanitized)

  // Additional validation to prevent traversal outside working directory
  const workingDir = process.cwd()
  if (!resolved.startsWith(workingDir)) {
    core.warning(`Path ${resolved} is outside working directory ${workingDir}`) // eslint-disable-line i18n-text/no-en
  }

  return resolved
}

/**
 * Validate SHA format if provided
 */
function validateSha(sha: string): boolean {
  if (!sha) return true // SHA is optional

  // SHA should be a 40-character hexadecimal string (Git SHA-1)
  const shaRegex = /^[a-f0-9]{40}$/i
  return shaRegex.test(sha)
}

/**
 * Sanitize report prefix to prevent injection attacks
 */
function sanitizeReportPrefix(prefix: string): string {
  if (!prefix) return ''

  // Allow only alphanumeric characters, hyphens, and underscores
  const sanitized = prefix.replace(/[^a-zA-Z0-9\-_]/g, '')

  if (sanitized !== prefix) {
    core.warning(
      `Report prefix was sanitized from '${prefix}' to '${sanitized}'` // eslint-disable-line i18n-text/no-en
    )
  }

  return sanitized
}

/**
 * Parse and validate action inputs
 */
export function parseActionInputs(): ActionInputs {
  const token = core.getInput('REPO_TOKEN')
  const trxPath = core.getInput('TRX_PATH')
  const ignoreTestFailures: boolean =
    core.getInput('IGNORE_FAILURE', {required: false}) === 'true'
  const sha = core.getInput('SHA')
  const reportPrefix = core.getInput('REPORT_PREFIX')

  // Validate required inputs
  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    throw new Error('REPO_TOKEN is required and must be a non-empty string')
  }

  if (!trxPath || typeof trxPath !== 'string' || trxPath.trim().length === 0) {
    throw new Error('TRX_PATH is required and must be a non-empty string')
  }

  // Validate and sanitize inputs
  const sanitizedTrxPath = sanitizePath(trxPath)

  if (sha && !validateSha(sha)) {
    throw new Error('SHA must be a valid 40-character hexadecimal string')
  }

  const sanitizedReportPrefix = reportPrefix
    ? sanitizeReportPrefix(reportPrefix)
    : undefined

  return {
    token: token.trim(),
    trxPath: sanitizedTrxPath,
    ignoreTestFailures,
    sha: sha || undefined,
    reportPrefix: sanitizedReportPrefix
  }
}
