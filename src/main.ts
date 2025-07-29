/* eslint-disable i18n-text/no-en */
import * as core from '@actions/core'

import {getTrxFiles} from './utils/file-utils'
import {transformAllTrxToJson} from './parsers/trx-parser'
import {areThereAnyFailingTests} from './utils/test-analyzer'
import {createCheckRun} from './services/github-service'
import {parseActionInputs} from './validators/input-validator'

export async function run(): Promise<void> {
  try {
    const inputs = parseActionInputs()

    core.info(`Finding Trx files in: ${inputs.trxPath}`)
    const trxFiles = await getTrxFiles(inputs.trxPath)

    core.info(`Processing ${trxFiles.length} trx files`)
    const trxToJson = await transformAllTrxToJson(trxFiles)

    core.info(`Checking for failing tests`)
    const failingTestsFound = areThereAnyFailingTests(trxToJson)

    // Process check runs in parallel for better performance
    await Promise.all(
      trxToJson.map(async data =>
        createCheckRun(
          inputs.token,
          inputs.ignoreTestFailures,
          data,
          inputs.sha,
          inputs.reportPrefix
        )
      )
    )

    if (failingTestsFound) {
      if (inputs.ignoreTestFailures) {
        core.warning(`Workflow configured to ignore test failures`)
      } else {
        core.setFailed('At least one failing test was found')
      }
    }

    core.setOutput('test-outcome', failingTestsFound ? 'Failed' : 'Passed')
    core.setOutput('trx-files', trxFiles)
    core.setOutput('report-prefix', inputs.reportPrefix)
  } catch (error: unknown) {
    core.setFailed((error as Error).message)
  }
}

run()
