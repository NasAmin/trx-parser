import github from '@actions/github'
import * as core from '@actions/core'

export async function createCheckRun(repoToken: string): Promise<void> {
  if (github.context.eventName === 'pullRequest') {
    const octokit = github.getOctokit(repoToken)
    octokit.checks.create({
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
  } else {
    core.info('Skipping status check as the trigger was not on a pull request')
  }
}
