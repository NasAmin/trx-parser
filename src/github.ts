/* eslint-disable import/no-unresolved */
/* eslint-disable i18n-text/no-en */
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as types from '@octokit/webhooks-types'

import {TrxDataWrapper} from './types/types'
import {getMarkupForTrx} from './markup'

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
    let git_sha = github.context.sha

    if (github.context.eventName === 'push') {
      core.info(`Creating status check for GitSha: ${git_sha} on a push event`)
    }

    if (github.context.eventName === 'pull_request') {
      const prPayload = github.context
        .payload as types.EventPayloadMap['pull_request']

      git_sha = prPayload.pull_request.head.sha
      core.info(
        `Creating status check for GitSha: ${git_sha} on a pull request event`
      )
    }

    if (sha) {
      git_sha = sha
      core.info(`Creating status check for user-provided GitSha: ${git_sha}`)
    }

    const markupData = getMarkupForTrx(reportData)
    const checkTime = new Date().toUTCString()
    const reportName = reportPrefix
      ? reportPrefix.concat('-', reportData.ReportMetaData.ReportName)
      : reportData.ReportMetaData.ReportName
    core.info(`Check time is: ${checkTime}`)
    const response = await octokit.checks.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: reportName.toLowerCase(),
      head_sha: git_sha,
      status: 'completed',
      conclusion:
        reportData.TrxData.TestRun.ResultSummary._outcome === 'Failed'
          ? ignoreTestFailures
            ? 'neutral'
            : 'failure'
          : 'success',
      output: {
        title: reportData.ReportMetaData.ReportTitle,
        summary: `This test run completed at \`${checkTime}\``,
        // text: reportData.ReportMetaData.TrxJSonString
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
