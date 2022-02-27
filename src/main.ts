import * as core from '@actions/core'
import {createCheckRun} from './github'
import {
  areThereAnyFailingTests,
  getTrxFiles,
  transformAllTrxToJson
} from './utils'

export async function run(): Promise<void> {
  try {
    const token = core.getInput('REPO_TOKEN')
    const trxPath = core.getInput('TRX_PATH')
    const ignoreTestFailures: boolean =
      core.getInput('IGNORE_FAILURE', {required: false}) === 'true'
    const sha = core.getInput('SHA')
    core.info(`Finding Trx files in: ${trxPath}`)
    const trxFiles = await getTrxFiles(trxPath)

    core.info(`Processing ${trxFiles.length} trx files`)
    const trxToJson = await transformAllTrxToJson(trxFiles)

    core.info(`Checking for failing tests`)
    const failingTestsFound = areThereAnyFailingTests(trxToJson)

    for (const data of trxToJson) {
      await createCheckRun(token, ignoreTestFailures, data, sha)
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
  } catch (error: any) {
    core.setFailed(error.message)
  }
}

run()
