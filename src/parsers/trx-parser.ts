/* eslint-disable i18n-text/no-en */
import * as core from '@actions/core'
import * as fs from 'fs'
import * as path from 'path'
import {XMLParser, XMLValidator} from 'fast-xml-parser'

import {TrxData, TrxDataWrapper, UnitTest} from '../types/types'
import {XML_PARSER_OPTIONS, XML_VALIDATOR_OPTIONS} from '../config/constants'
import {readTrxFile} from '../utils/file-utils'

/**
 * Transform a single TRX file to JSON format with security validation
 */
export async function transformTrxToJson(
  filePath: string
): Promise<TrxDataWrapper> {
  // Validate file path security
  const resolvedPath = path.resolve(filePath)
  if (!resolvedPath.endsWith('.trx')) {
    throw new Error(`Security: Only .trx files are allowed: ${filePath}`)
  }

  if (!fs.existsSync(resolvedPath)) {
    core.warning(`Trx file ${resolvedPath} does not exist`)
    return createEmptyTrxDataWrapper(resolvedPath)
  }

  core.info(`Transforming file ${resolvedPath}`)

  try {
    const xmlData = await readTrxFile(resolvedPath)

    // Security: Validate XML size to prevent DoS attacks
    const maxFileSize = 50 * 1024 * 1024 // 50MB limit
    if (xmlData.length > maxFileSize) {
      throw new Error(
        `File too large: ${xmlData.length} bytes exceeds ${maxFileSize} bytes limit`
      )
    }

    // Security: Check for suspicious content before parsing
    if (
      xmlData.includes('<!ENTITY') ||
      xmlData.includes('<!DOCTYPE') ||
      xmlData.includes('SYSTEM') ||
      xmlData.includes('PUBLIC') ||
      (xmlData.includes('&') && xmlData.includes(';'))
    ) {
      core.warning(
        'XML contains potentially dangerous constructs (entities, DTD references, or external references)'
      )
      // For security, we could choose to reject such files entirely
      // throw new Error('XML contains potentially dangerous constructs and cannot be processed')
    }

    const xmlParser = new XMLParser(XML_PARSER_OPTIONS)

    const isValid = XMLValidator.validate(xmlData, XML_VALIDATOR_OPTIONS)
    if (isValid !== true) {
      throw new Error(
        `Invalid XML in file ${resolvedPath}: ${JSON.stringify(isValid)}`
      )
    }

    const jsonString = xmlParser.parse(xmlData, true)
    const testData = jsonString as TrxData

    // Check for run failures
    const runInfos = testData.TestRun?.ResultSummary?.RunInfos
    if (runInfos?.RunInfo?._outcome === 'Failed') {
      core.warning('Test run contains failures')
    }

    const reportHeaders = getReportHeaders(testData)

    return {
      TrxData: testData,
      IsEmpty: isEmpty(testData),
      ReportMetaData: {
        TrxFilePath: resolvedPath,
        ReportName: `${reportHeaders.reportName}-check`,
        ReportTitle: reportHeaders.reportTitle,
        TrxJSonString: JSON.stringify(jsonString),
        TrxXmlString: xmlData
      }
    }
  } catch (error) {
    core.error(
      `Failed to process TRX file ${resolvedPath}: ${(error as Error).message}`
    )
    throw error
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
