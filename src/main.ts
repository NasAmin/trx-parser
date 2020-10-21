import * as core from '@actions/core'
import {
  areThereAnyFailingTests,
  getTrxFiles,
  transformAllTrxToJson
} from './utils'

export async function run(): Promise<void> {
  try {
    const trxPath = core.getInput('TRX_PATH')
    core.setCommandEcho(true)

    core.setOutput('test-outcome', 'Passed')
    core.setOutput('trx-path', trxPath)

    const trxFiles = await getTrxFiles(trxPath)
    const trxToJson = await transformAllTrxToJson(trxFiles)
    const failingTestsFound = areThereAnyFailingTests(trxToJson)

    if (failingTestsFound) {
      core.setFailed('Failing tests found')
    }

    core.setOutput('trx-files', trxFiles)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
