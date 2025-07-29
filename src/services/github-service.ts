/* eslint-disable i18n-text/no-en */
/* eslint-disable import/no-unresolved */
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as types from '@octokit/webhooks-types'

import {TrxDataWrapper} from '../types/types'
import {getMarkupForTrx} from './report-service'

/**
 * Create a GitHub check run for test results
 */
export async function createCheckRun(
  repoToken: string,
  ignoreTestFailures: boolean,
  reportData: TrxDataWrapper,
  sha?: string,
  reportPrefix?: string
): Promise<void> {
  try {
    core.info(`Creating PR check for ${reportData.ReportMetaData.ReportTitle}`)
    const octokit = github.getOctokit(repoToken)

    const gitSha = determineGitSha(sha)
    const markupData = getMarkupForTrx(reportData)
    const checkTime = new Date().toUTCString()
    const reportName = buildReportName(
      reportPrefix,
      reportData.ReportMetaData.ReportName
    )

    core.info(`Check time is: ${checkTime}`)

    const response = await octokit.rest.checks.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: reportName.toLowerCase(),
      head_sha: gitSha,
      status: 'completed',
      conclusion: determineCheckConclusion(reportData, ignoreTestFailures),
      output: {
        title: reportData.ReportMetaData.ReportTitle,
        summary: `This test run completed at \`${checkTime}\``,
        text: markupData
      }
    })

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
    core.setFailed((error as Error).message)
  }
}

/**
 * Determine the git SHA to use for the check
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
    gitSha = sha
    core.info(`Creating status check for user-provided GitSha: ${gitSha}`)
  }

  return gitSha
}

/**
 * Build the report name with optional prefix
 */
function buildReportName(
  reportPrefix: string | undefined,
  reportName: string
): string {
  return reportPrefix ? reportPrefix.concat('-', reportName) : reportName
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
