import * as github from '@actions/github'
import * as core from '@actions/core'
import {TrxDataWrapper} from './types/types'
import * as Webhooks from '@octokit/webhooks'
import {getMarkupForTrxFromGist} from './markup'

export async function createCheckRun(
  repoToken: string,
  reportData: TrxDataWrapper
): Promise<void> {
  try {
    core.info('Trying to create check')
    const prPayload = github.context
      .payload as Webhooks.EventPayloads.WebhookPayloadPullRequest

    core.info(`Head sha from the payload ${prPayload.pull_request.head.sha}`)
    const octokit = github.getOctokit(repoToken)
    const git_sha = prPayload.pull_request.head.sha
    if (github.context.eventName === 'pull_request') {
      core.info(`PR Ref: ${github.context.ref}`)
      core.info(`Creating status check for GitSha: ${git_sha}`)
      const markupData = await getMarkupForTrxFromGist(
        reportData.ReportMetaData.MarkupFilePath
      )
      const checkTime = new Date().toUTCString()
      const reportName = `${reportData.ReportMetaData.ReportName} Check`
      const response = await octokit.checks.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        name: reportName,
        head_sha: git_sha,
        status: 'completed',
        conclusion:
          reportData.TrxData.TestRun.ResultSummary._outcome === 'Failed'
            ? 'failure'
            : 'success',
        output: {
          title: reportData.ReportMetaData.ReportTitle,
          summary: `This test run completed at ${checkTime}`,
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
    } else {
      core.info(
        'Skipping status check as the trigger was not on a pull request'
      )
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}
