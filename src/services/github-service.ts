/* eslint-disable i18n-text/no-en */
/* eslint-disable import/no-unresolved */
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as types from '@octokit/webhooks-types'

import {TrxDataWrapper} from '../types/types'
import {getMarkupForTrx} from './report-service'
import {withSpan} from './telemetry-service'

/**
 * Create a GitHub check run for test results with security validation
 */
export async function createCheckRun(
  repoToken: string,
  ignoreTestFailures: boolean,
  reportData: TrxDataWrapper,
  sha?: string,
  reportPrefix?: string
): Promise<void> {
  try {
    // Security: Validate token format (should start with 'ghp_' for GitHub personal access tokens)
    if (
      !repoToken ||
      typeof repoToken !== 'string' ||
      repoToken.trim().length === 0
    ) {
      throw new Error('Invalid repository token provided')
    }

    // Security: Sanitize report prefix to prevent injection
    const sanitizedReportPrefix =
      reportPrefix?.replace(/[^-a-zA-Z0-9_]/g, '') || undefined
    if (reportPrefix && sanitizedReportPrefix !== reportPrefix) {
      core.warning(`Report prefix was sanitized for security`)
    }

    core.info(`Creating PR check for ${reportData.ReportMetaData.ReportTitle}`)
    const octokit = github.getOctokit(repoToken)

    const gitSha = determineGitSha(sha)
    const markupData = getMarkupForTrx(reportData)
    const checkTime = new Date().toUTCString()
    const reportName = buildReportName(
      sanitizedReportPrefix,
      reportData.ReportMetaData.ReportName
    )

    core.info(`Check time is: ${checkTime}`)

    // Security: Validate report name to prevent injection
    const sanitizedReportName = reportName
      .toLowerCase()
      .replace(/[^-a-zA-Z0-9_]/g, '-')

    const response = await withSpan(
      'github_check_create',
      async () => {
        return octokit.rest.checks.create({
          owner: github.context.repo.owner,
          repo: github.context.repo.repo,
          name: sanitizedReportName,
          head_sha: gitSha,
          status: 'completed',
          conclusion: determineCheckConclusion(reportData, ignoreTestFailures),
          output: {
            title: reportData.ReportMetaData.ReportTitle,
            summary: `This test run completed at \`${checkTime}\``,
            text: markupData
          }
        })
      },
      {
        check_name: sanitizedReportName,
        sha: gitSha,
        total_tests: reportData.IsEmpty
          ? 0
          : reportData.TrxData.TestRun?.ResultSummary?.Counters?._total || 0,
        failed_tests: reportData.IsEmpty
          ? 0
          : reportData.TrxData.TestRun?.ResultSummary?.Counters?._failed || 0,
        conclusion: determineCheckConclusion(reportData, ignoreTestFailures)
      }
    )

    if (response.status !== 201) {
      throw new Error(
        `Failed to create status check. Error code: ${response.status}`
      )
    } else {
      core.info(
        `Created check: ${response.data.name} with response status ${response.status}`
      )
    }
  } catch (error: unknown) {
    const errorMessage = (error as Error).message
    // Security: Don't log tokens or sensitive information
    const sanitizedMessage = errorMessage.replace(
      /ghp_[a-zA-Z0-9]{36}/g,
      '[REDACTED_TOKEN]'
    )
    core.setFailed(sanitizedMessage)
  }
}

/**
 * Determine the git SHA to use for the check with validation
 */
function determineGitSha(sha?: string): string {
  let gitSha = github.context.sha

  if (github.context.eventName === 'push') {
    core.info(`Creating status check for GitSha: ${gitSha} on a push event`)
  }

  if (github.context.eventName === 'pull_request') {
    const prPayload = github.context
      .payload as types.EventPayloadMap['pull_request']

    gitSha = prPayload.pull_request.head.sha
    core.info(
      `Creating status check for GitSha: ${gitSha} on a pull request event`
    )
  }

  if (sha) {
    // Security: Validate SHA format
    const shaRegex = /^[a-f0-9]{40}$/i
    if (!shaRegex.test(sha)) {
      throw new Error(`Invalid SHA format: ${sha}`)
    }
    gitSha = sha
    core.info(`Creating status check for user-provided GitSha: ${gitSha}`)
  }

  return gitSha
}

/**
 * Build the report name with optional prefix and sanitization
 */
function buildReportName(
  reportPrefix: string | undefined,
  reportName: string
): string {
  // Security: Sanitize inputs to prevent injection attacks
  const sanitizedReportName = reportName.replace(/[^-a-zA-Z0-9_]/g, '-')
  const sanitizedPrefix = reportPrefix?.replace(/[^-a-zA-Z0-9_]/g, '-')

  return sanitizedPrefix
    ? sanitizedPrefix.concat('-', sanitizedReportName)
    : sanitizedReportName
}

/**
 * Determine the check conclusion based on test results
 */
function determineCheckConclusion(
  reportData: TrxDataWrapper,
  ignoreTestFailures: boolean
): 'success' | 'failure' | 'neutral' {
  const isTestFailed =
    reportData.TrxData.TestRun?.ResultSummary?._outcome === 'Failed'

  if (isTestFailed) {
    return ignoreTestFailures ? 'neutral' : 'failure'
  }

  return 'success'
}
