/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs'
import * as path from 'path'
import * as uitl from 'util'
import * as core from '@actions/core'
import * as xmlParser from 'fast-xml-parser'
import * as he from 'he'
import {promises} from 'fs'
import {TrxData, TrxDataWrapper, UnitTest} from './types/types'

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
      // attrNodeName: 'attr', //default is 'false'
      textNodeName: '#text',
      ignoreAttributes: false,
      ignoreNameSpace: false,
      allowBooleanAttributes: true,
      parseNodeValue: true,
      parseAttributeValue: true,
      trimValues: true,
      cdataTagName: '__cdata', //default is 'false'
      cdataPositionChar: '\\c',
      parseTrueNumberOnly: false,
      arrayMode: false, //"strict"
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      attrValueProcessor: (val: string, _attrName: string) =>
        he.decode(val, {isAttributeValue: true}), //default is a=>a
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      tagValueProcessor: (val: string, _tagName: string) => he.decode(val), //default is a=>a
      stopNodes: ['parse-me-as-string']
    }

    if (xmlParser.validate(xmlData.toString()) === true) {
      const jsonString = xmlParser.parse(xmlData, options, true)
      const reportHeaders = getReportHeaders(jsonString)
      if (!reportHeaders)
        return trxDataWrapper;

      trxDataWrapper = {
        TrxData: jsonString as TrxData,
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

export async function readTrxFile(filePath: string): Promise<string> {
  return await promises.readFile(filePath, 'utf8')
}

export async function transformAllTrxToJson(
  trxFiles: string[]
): Promise<TrxDataWrapper[]> {
  const transformedTrxReports: TrxDataWrapper[] = []
  for (const trx of trxFiles) {
    try {
      const trxToJson = await transformTrxToJson(trx);
      if (trxToJson)
        transformedTrxReports.push(trxToJson)
    } catch (ex) {
      throw new Error(`Processing of TRX: ${trx} failed with error: ${ex.message}`)
    }
  }

  return transformedTrxReports
}

export function areThereAnyFailingTests(
  trxJsonReports: TrxDataWrapper[]
): boolean {
  for (const trxData of trxJsonReports) {
    if (trxData.TrxData.TestRun.ResultSummary._outcome === 'Failed') {
      return true
    }
  }
  return false
}

function getReportHeaders(
  data: TrxData
): {reportName: string; reportTitle: string} {
  if (!data.TestRun.TestDefinitions)
    return null as any;

  let reportTitle = ''
  let reportName = ''
  const unittests = data.TestRun.TestDefinitions.UnitTest

  const storage = getAssemblyName(unittests)

  const dllName = (storage.split('\\').pop() as string).split('/').pop()

  if (dllName) {
    reportTitle = dllName.replace('.dll', '').toUpperCase().replace('.', ' ')
    reportName = dllName.replace('.dll', '').toUpperCase()
  }

  return {reportName, reportTitle}
}

function getAssemblyName(unittests: UnitTest[]): string {
  if (Array.isArray(unittests)) {
    core.info('Its an array')
    return unittests[0]._storage
  } else {
    const ut = unittests as UnitTest
    core.info(`Its not an array: ${ut._storage}`)
    return ut._storage
  }
}
