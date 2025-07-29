import * as core from '@actions/core'

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
  if (!token) {
    throw new Error('REPO_TOKEN is required')
  }

  if (!trxPath) {
    throw new Error('TRX_PATH is required')
  }

  return {
    token,
    trxPath,
    ignoreTestFailures,
    sha: sha || undefined,
    reportPrefix: reportPrefix || undefined
  }
}
