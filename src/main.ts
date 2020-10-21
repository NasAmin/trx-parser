import * as core from '@actions/core'
import {createCheckRun} from './github'
import {
  areThereAnyFailingTests,
  getTrxFiles,
  transformAllTrxToJson
} from './utils'

export async function run(): Promise<void> {
  try {
    const token = core.getInput('repo-token')
    const trxPath = core.getInput('TRX_PATH')
    core.setCommandEcho(true)

    core.setOutput('test-outcome', 'Passed')
    core.setOutput('trx-path', trxPath)

    core.info(`Finding Trx files in: ${trxPath}`)
    const trxFiles = await getTrxFiles(trxPath)

    core.info(`Processing ${trxFiles.length} trx files`)
    const trxToJson = await transformAllTrxToJson(trxFiles)

    core.info(`Checking for failing tests`)
    const failingTestsFound = areThereAnyFailingTests(trxToJson)

    if (failingTestsFound) {
      core.error(`At least one failing test was found`)
      createCheckRun(token)
      core.setFailed('Failing tests found')
    }

    core.setOutput('trx-files', trxFiles)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
