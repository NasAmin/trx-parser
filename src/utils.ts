/* eslint-disable i18n-text/no-en */
import * as core from '@actions/core'
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs'
import * as path from 'path'
import * as uitl from 'util'
import {XMLParser, XMLValidator} from 'fast-xml-parser'

import {TrxData, TrxDataWrapper, UnitTest} from './types/types'

import {promises} from 'fs'

export async function getTrxFiles(trxPath: string): Promise<string[]> {
  if (!fs.existsSync(trxPath)) return []

  const readdir = uitl.promisify(fs.readdir)
  const fileNames = await readdir(trxPath)
  const trxFiles = fileNames.filter(f => f.endsWith('.trx'))
  core.info(`Files count: ${fileNames.length}`)
  const filesWithAbsolutePaths = getAbsoluteFilePaths(trxFiles, trxPath)
  return filesWithAbsolutePaths
}

export function getAbsoluteFilePaths(
  fileNames: string[],
  directoryName: string
): string[] {
  const absolutePaths: string[] = []
  for (const file of fileNames) {
    const absolutePath = path.join(directoryName, file)
    absolutePaths.push(absolutePath)
  }
  return absolutePaths
}

export async function transformTrxToJson(
  filePath: string
): Promise<TrxDataWrapper> {
  let trxDataWrapper: any

  if (fs.existsSync(filePath)) {
    core.info(`Transforming file ${filePath}`)

    const xmlData = await readTrxFile(filePath)
    const options = {
      attributeNamePrefix: '_',
      // attrNodeName: '@', //default is 'false'
      textNodeName: '#text',
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: true,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      format: true,
      indentBy: '  ',
      supressEmptyNode: false,
      rootNodeName: 'element',
      cdataTagName: '__cdata', //default is 'false'
      cdataPositionChar: '\\c',
      parseTrueNumberOnly: false,
      arrayMode: false, //"strict"
      stopNodes: ['parse-me-as-string']
    }

    const xmlParser = new XMLParser(options)
    const isValid = XMLValidator.validate(xmlData, {
      allowBooleanAttributes: true
    })
    if (isValid === true) {
      const jsonString = xmlParser.parse(xmlData, true)
      const testData = jsonString as TrxData
      const runInfos = testData.TestRun.ResultSummary.RunInfos
      if (runInfos && runInfos.RunInfo._outcome === 'Failed') {
        core.warning('There is trouble')
      }

      const reportHeaders = getReportHeaders(testData)
      trxDataWrapper = {
        TrxData: jsonString as TrxData,
        IsEmpty: IsEmpty(testData),
        ReportMetaData: {
          TrxFilePath: filePath,
          ReportName: `${reportHeaders.reportName}-check`,
          ReportTitle: reportHeaders.reportTitle,
          TrxJSonString: JSON.stringify(jsonString),
          TrxXmlString: xmlData
        }
      }
    }
  } else {
    core.warning(`Trx file ${filePath} does not exist`)
  }
  return trxDataWrapper
}

function IsEmpty(testData: TrxData): boolean {
  return testData.TestRun.TestDefinitions ? false : true
}

export async function readTrxFile(filePath: string): Promise<string> {
  return await promises.readFile(filePath, 'utf8')
}

export async function transformAllTrxToJson(
  trxFiles: string[]
): Promise<TrxDataWrapper[]> {
  const transformedTrxReports: TrxDataWrapper[] = []
  for (const trx of trxFiles) {
    transformedTrxReports.push(await transformTrxToJson(trx))
  }

  return transformedTrxReports
}

export function areThereAnyFailingTests(
  trxJsonReports: TrxDataWrapper[]
): boolean {
  for (const trxData of trxJsonReports) {
    // Check the actual failed count instead of just the outcome
    // The outcome can be "Failed" due to test host issues even when no tests actually failed
    if (trxData.TrxData.TestRun.ResultSummary.Counters._failed > 0) {
      return true
    }
  }
  return false
}

function getReportHeaders(
  data: TrxData
): {
  reportName: string
  reportTitle: string
} {
  let reportTitle = ''
  let reportName = ''
  const isEmpty = IsEmpty(data)

  if (isEmpty) {
    reportTitle = data.TestRun.ResultSummary.RunInfos.RunInfo._computerName
    reportName = data.TestRun.ResultSummary.RunInfos.RunInfo._computerName.toUpperCase()
  } else {
    const unittests = data.TestRun?.TestDefinitions?.UnitTest

    const storage = getAssemblyName(unittests)

    const dllName = storage.split('/').pop()

    if (dllName) {
      reportTitle = dllName.replace('.dll', '').toUpperCase().replace('.', ' ')
      reportName = dllName.replace('.dll', '').toUpperCase()
    }
  }

  return {reportName, reportTitle}
}

function getAssemblyName(unittests: UnitTest[]): string {
  if (Array.isArray(unittests)) {
    core.debug('Its an array')
    return unittests[0]._storage
  } else {
    const ut = unittests as UnitTest
    if (ut) {
      core.debug(`Its not an array: ${ut._storage}`)
      return ut._storage
    } else {
      return 'NOT FOUND'
    }
  }
}
