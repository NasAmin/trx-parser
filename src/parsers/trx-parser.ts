/* eslint-disable i18n-text/no-en */
import * as core from '@actions/core'
import * as fs from 'fs'
import {XMLParser, XMLValidator} from 'fast-xml-parser'

import {TrxData, TrxDataWrapper, UnitTest} from '../types/types'
import {XML_PARSER_OPTIONS, XML_VALIDATOR_OPTIONS} from '../config/constants'
import {readTrxFile} from '../utils/file-utils'

/**
 * Transform a single TRX file to JSON format
 */
export async function transformTrxToJson(
  filePath: string
): Promise<TrxDataWrapper> {
  if (!fs.existsSync(filePath)) {
    core.warning(`Trx file ${filePath} does not exist`)
    // Return empty wrapper for non-existent files
    return createEmptyTrxDataWrapper(filePath)
  }

  core.info(`Transforming file ${filePath}`)

  const xmlData = await readTrxFile(filePath)
  const xmlParser = new XMLParser(XML_PARSER_OPTIONS)

  const isValid = XMLValidator.validate(xmlData, XML_VALIDATOR_OPTIONS)
  if (isValid !== true) {
    throw new Error(`Invalid XML in file ${filePath}: ${isValid}`)
  }

  const jsonString = xmlParser.parse(xmlData, true)
  const testData = jsonString as TrxData

  // Check for run failures
  const runInfos = testData.TestRun.ResultSummary.RunInfos
  if (runInfos?.RunInfo._outcome === 'Failed') {
    core.warning('There is trouble')
  }

  const reportHeaders = getReportHeaders(testData)

  return {
    TrxData: testData,
    IsEmpty: isEmpty(testData),
    ReportMetaData: {
      TrxFilePath: filePath,
      ReportName: `${reportHeaders.reportName}-check`,
      ReportTitle: reportHeaders.reportTitle,
      TrxJSonString: JSON.stringify(jsonString),
      TrxXmlString: xmlData
    }
  }
}

/**
 * Transform multiple TRX files to JSON format in parallel
 */
export async function transformAllTrxToJson(
  trxFiles: string[]
): Promise<TrxDataWrapper[]> {
  // Process files in parallel for better performance
  return await Promise.all(trxFiles.map(async trx => transformTrxToJson(trx)))
}

/**
 * Check if test data is empty (no test definitions)
 */
function isEmpty(testData: TrxData): boolean {
  return !testData.TestRun.TestDefinitions
}

/**
 * Create an empty TRX data wrapper for error cases
 */
function createEmptyTrxDataWrapper(filePath: string): TrxDataWrapper {
  return {
    TrxData: {} as TrxData,
    IsEmpty: true,
    ReportMetaData: {
      TrxFilePath: filePath,
      ReportName: 'error-check',
      ReportTitle: 'File Not Found',
      TrxJSonString: '{}',
      TrxXmlString: ''
    }
  }
}

/**
 * Generate report headers from test data
 */
function getReportHeaders(data: TrxData): {
  reportName: string
  reportTitle: string
} {
  let reportTitle = ''
  let reportName = ''
  const isEmptyData = isEmpty(data)

  if (isEmptyData) {
    reportTitle = data.TestRun.ResultSummary.RunInfos.RunInfo._computerName
    reportName =
      data.TestRun.ResultSummary.RunInfos.RunInfo._computerName.toUpperCase()
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

/**
 * Extract assembly name from unit tests
 */
function getAssemblyName(unittests: UnitTest[]): string {
  if (Array.isArray(unittests)) {
    core.debug('Its an array')
    return unittests[0]?._storage ?? 'NOT FOUND'
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
