import * as exec from '@actions/exec'
import * as core from '@actions/core'
import * as fs from 'fs'

export async function generateMarkupFile(
  reportTitle: string,
  reportName: string
): Promise<void> {
  let stdOutString = ''
  let stdErrString = ''

  core.info(`Generating Markup for ${reportName}`)

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

  const workspace = __dirname.replace(/[/\\]$/, '')

  core.info(`Current workspace is: ${workspace}`)

  const pwshScript = `${workspace}/trx-reports`

  core.info(`Powershell scripts path is ${pwshScript}`)
  options.cwd = pwshScript

  if (fs.existsSync(pwshScript)) {
    await exec.exec(
      'pwsh',
      ['-f', `${pwshScript}/sample-test-results.ps1`],
      options
    )
  } else {
    core.info(`The file ${pwshScript} does not exist`)
  }

  core.info(`Generating Markup for ${reportName}`)
  core.info(`Generating Markup for ${reportTitle}`)
  core.info(`Stdout ${stdOutString}`)
  core.info(`StdErr ${stdErrString}`)
}
