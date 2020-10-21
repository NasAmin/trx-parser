import * as github from '@actions/github'
import * as core from '@actions/core'

export async function createCheckRun(repoToken: string): Promise<void> {
  try {
    core.info('Trying to create check')
    const octokit = github.getOctokit(repoToken)
    if (github.context.eventName === 'pull_request') {
      const response = await octokit.checks.create({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        name: 'trx-parser',
        head_sha: github.context.sha,
        status: 'completed',
        conclusion: 'neutral',
        output: {
          title: 'My test report',
          summary: `This test run completed at ${Date.now()}`,
          text: 'test'
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