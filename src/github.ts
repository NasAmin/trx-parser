import * as github from '@actions/github'
import * as core from '@actions/core'
import {TrxDataWrapper} from './types/types'

export async function createCheckRun(
  repoToken: string,
  reportData: TrxDataWrapper
): Promise<void> {
  try {
    core.info('Trying to create check')
    const octokit = github.getOctokit(repoToken)
    if (github.context.eventName === 'pull_request') {
      core.info(`Creating status check for GitSha: ${github.context.sha}`)
      const response = await octokit.checks.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        name: reportData.ReportMetaData.ReportName.toLowerCase(),
        head_sha: github.context.sha,
        status: 'completed',
        conclusion:
          reportData.TrxData.TestRun.ResultSummary._outcome === 'Failed'
            ? 'failure'
            : 'success',
        output: {
          title: reportData.ReportMetaData.ReportTitle,
          summary: `This test run completed at ${Date.now()}`,
          text: reportData.ReportMetaData.TrxJSonString
        }
      })

      if (response.status !== 201) {
        throw new Error(
          `Failed to create status check. Error code: ${response.status}`
        )
      } else {
        core.info(`Created check: ${response.data.name}`)
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
