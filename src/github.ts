import * as github from '@actions/github'
import * as core from '@actions/core'
import {TrxDataWrapper} from './types/types'
import * as Webhooks from '@octokit/webhooks'
import {getMarkupForTrx} from './markup'

export async function createCheckRun(
  repoToken: string,
  ignoreTestFailures: boolean,
  reportData: TrxDataWrapper
): Promise<void> {
  try {
    core.info(`Creating PR check for ${reportData.ReportMetaData.ReportTitle}`)
    const octokit = github.getOctokit(repoToken)
    let git_sha = github.context.sha
    core.info(`Head sha from branch ${git_sha}`)

    if (github.context.eventName === 'push') {
      core.info(`Head sha from branch ${git_sha}`)
      core.info(`Creating status check for GitSha: ${git_sha} on a push event`)
    }

    if (github.context.eventName === 'pull_request') {
      const prPayload = github.context
        .payload as Webhooks.EventPayloads.WebhookPayloadPullRequest

      core.info(
        `Head sha from the pull request payload ${prPayload.pull_request.head.sha}`
      )

      git_sha = prPayload.pull_request.head.sha

      core.info(`PR Ref: ${github.context.ref}`)
      core.info(
        `Creating status check for GitSha: ${git_sha} on a pull request event`
      )
    }
    const markupData = getMarkupForTrx(reportData)
    const checkTime = new Date().toUTCString()
    core.info(`Check time is: ${checkTime}`)
    const response = await octokit.checks.create({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      name: reportData.ReportMetaData.ReportName.toLowerCase(),
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
  } catch (error) {
    core.setFailed(error.message)
  }
}
