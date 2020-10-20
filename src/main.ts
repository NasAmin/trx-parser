import * as core from '@actions/core'
import {getTrxFiles} from './utils'

export async function run(): Promise<void> {
  try {
    const trxPath = core.getInput('TRX_PATH')
    core.setCommandEcho(true)

    core.setOutput('test-outcome', 'Passed')
    core.setOutput('trx-path', trxPath)

    const trxFiles = await getTrxFiles(trxPath)

    core.setOutput('trx-files', trxFiles)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
