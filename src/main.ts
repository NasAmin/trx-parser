import * as core from '@actions/core'

export async function run(): Promise<void> {
  try {
    core.setOutput('test-outcome', 'Passed')    
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
