/* eslint-disable @typescript-eslint/no-unused-vars */
import * as exec from '@actions/exec'
import * as core from '@actions/core'

export async function generateMarkupFile(
  reportTitle: string,
  reportName: string
): Promise<void> {
  let stdOutString = ''
  let stdErrString = ''

  const options: exec.ExecOptions = {}

  options.listeners = {
    stdout: (data: Buffer) => {
      stdOutString += data.toString()
    },
    stderr: (data: Buffer) => {
      stdErrString += data.toString()
    }
  }
  // options.cwd = './lib'
  // await exec(
  //   'pwsh',
  //   ['-f', 'sample-test-results.ps1', reportTitle, reportName],
  //   options
  // )
  await exec.exec('bash -c', ['ls && echo blah'], options)

  core.info(stdOutString)
  core.warning(stdErrString)

  core.info(reportName)
  core.warning(reportTitle)
}
