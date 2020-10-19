import * as core from '@actions/core'

export async function run(): Promise<void> {
  try {
    const trxPath = core.getInput('TRX_PATH')
    core.setCommandEcho(true)

    core.setOutput('test-outcome', 'Passed')
    core.setOutput('trx-path', trxPath)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
