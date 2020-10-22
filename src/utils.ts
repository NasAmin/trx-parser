/* eslint-disable @typescript-eslint/no-explicit-any */
import * as fs from 'fs'
import * as path from 'path'
import * as uitl from 'util'
import * as core from '@actions/core'
import * as xmlParser from 'fast-xml-parser'
import * as he from 'he'
import {promises} from 'fs'
import {TrxData} from './types/types'

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

export async function transformTrxToJson(filePath: string): Promise<TrxData> {
  let jsonObj: any

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
      jsonObj = xmlParser.parse(xmlData, options, true)
    }
  } else {
    core.warning(`Trx file ${filePath} does not exist`)
  }
  return jsonObj
}

export async function readTrxFile(filePath: string): Promise<string> {
  return await promises.readFile(filePath, 'utf8')
}

export async function transformAllTrxToJson(
  trxFiles: string[]
): Promise<TrxData[]> {
  const transformedTrxReports: TrxData[] = []
  for (const trx of trxFiles) {
    transformedTrxReports.push(await transformTrxToJson(trx))
  }

  return transformedTrxReports
}

export function areThereAnyFailingTests(trxJsonReports: TrxData[]): boolean {
  for (const trxData of trxJsonReports) {
    if (trxData.TestRun.ResultSummary._outcome === 'Failed') {
      return true
    }
  }
  return false
}
