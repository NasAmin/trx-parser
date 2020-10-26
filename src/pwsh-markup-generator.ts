import * as exec from '@actions/exec'
import * as core from '@actions/core'
import * as fs from 'fs'
import {TrxData} from './types/types'
export async function generateMarkupFile(testData: TrxData): Promise<void> {
  let stdOutString = ''
  let stdErrString = ''

  core.info(`Generating Markup for ${testData.ReportMetaData}`)

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
        testData.ReportMetaData.ReportName,
        '-reportTitle',
        testData.ReportMetaData.ReportTitle,
        '-trxPath',
        testData.ReportMetaData.TrxFilePath,
        '-markupPath',
        testData.ReportMetaData.MarkupFilePath
      ],
      options
    )
  } else {
    core.info(`The file ${pwshScript} does not exist`)
  }

  if (fs.existsSync(testData.ReportMetaData.MarkupFilePath)) {
    core.info(`Markup file ${testData.ReportMetaData.MarkupFilePath} exists`)
  } else {
    core.info(
      `Markup file ${testData.ReportMetaData.MarkupFilePath} does not exist`
    )
  }

  core.info(`Stdout ${stdOutString}`)
  core.warning(`StdErr ${stdErrString}`)
}

export async function generateMarkupReports(
  testData: TrxData[]
): Promise<void> {
  for (const data of testData) {
    await generateMarkupFile(data)
  }
}
