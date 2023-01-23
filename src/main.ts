/* eslint-disable i18n-text/no-en */
import * as core from '@actions/core'

import {
  areThereAnyFailingTests,
  getTrxFiles,
  transformAllTrxToJson
} from './utils'

import {createCheckRun} from './github'

export async function run(): Promise<void> {
  try {
    const token = core.getInput('REPO_TOKEN')
    const trxPath = core.getInput('TRX_PATH')
    const ignoreTestFailures: boolean =
      core.getInput('IGNORE_FAILURE', {required: false}) === 'true'
    const sha = core.getInput('SHA')
    const reportPrefix = core.getInput('REPORT_PREFIX')
    core.info(`Finding Trx files in: ${trxPath}`)
    const trxFiles = await getTrxFiles(trxPath)

    core.info(`Processing ${trxFiles.length} trx files`)
    const trxToJson = await transformAllTrxToJson(trxFiles)

    core.info(`Checking for failing tests`)
    const failingTestsFound = areThereAnyFailingTests(trxToJson)

    for (const data of trxToJson) {
      await createCheckRun(token, ignoreTestFailures, data, sha, reportPrefix)
    }

    if (failingTestsFound) {
      if (ignoreTestFailures) {
        core.warning(`Workflow configured to ignore test failures`)
      } else {
        core.setFailed('At least one failing test was found')
      }
    }
    core.setOutput('test-outcome', failingTestsFound ? 'Failed' : 'Passed')
    core.setOutput('trx-files', trxFiles)
  } catch (error: unknown) {
    core.setFailed((error as Error).message)
  }
}

run()
