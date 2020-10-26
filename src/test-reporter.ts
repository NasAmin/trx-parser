import * as exec from '@actions/exec'
import * as core from '@actions/core'
import * as fs from 'fs'
import {TrxData} from './types/types'

export async function generateMarkupFile(
  reportTitle: string,
  reportName: string,
  trxPath: string
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

  const workspace = __dirname.replace(/[/\\]$/, '')

  core.info(`Current workspace is: ${workspace}`)

  const pwshScript = `${workspace}/trx-reports`

  core.info(`Powershell scripts path is ${pwshScript}`)
  options.cwd = pwshScript

  if (fs.existsSync(pwshScript)) {
    await exec.exec(
      'pwsh',
      [
        '-f',
        `${pwshScript}/markup.ps1`,
        '-reportName',
        reportName,
        '-reportTitle',
        reportTitle,
        '-trxPath',
        trxPath
      ],
      options
    )
  } else {
    core.info(`The file ${pwshScript} does not exist`)
  }

  if (fs.existsSync(`${pwshScript}/sample-test-results.md`)) {
    core.info('Markup file exists')
  } else {
    core.info('Markup file does not exist')
  }
  core.info(`Stdout ${stdOutString}`)
  core.warning(`StdErr ${stdErrString}`)
}

export async function generateMarkupReports(
  testData: TrxData[]
): Promise<void> {
  for (const data of testData) {
    const reportHeaders = getReportHeaders(data)
    await generateMarkupFile(
      reportHeaders.reportTitle,
      reportHeaders.reportName,
      data.TrxFilePath
    )
  }
}

function getReportHeaders(
  data: TrxData
): {reportName: string; reportTitle: string} {
  let reportTitle = ''
  let reportName = ''
  const dllName = data.TestRun.TestDefinitions.UnitTest[0]._storage
    .split('/')
    .pop()

  if (dllName) {
    reportTitle = dllName.replace('.dll', '').toUpperCase().replace('.', ' ')
    reportName = dllName.replace('.dll', '').toUpperCase()
  }

  return {reportName, reportTitle}
}
