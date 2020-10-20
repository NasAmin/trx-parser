import * as fs from 'fs'
import * as path from 'path'
import * as uitl from 'util'
import * as core from '@actions/core'
import * as xmlParser from 'fast-xml-parser'
import * as he from 'he'

export async function getTrxFiles(trxPath: string): Promise<string[]> {
  // TODO: Convert to async version
  // const files = fs.readdirSync(path.resolve(trxPath), {withFileTypes: true})
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

export async function loadXmlFile(filePath: string): Promise<unknown> {
  if (fs.existsSync(filePath)) {
    fs.readFile(filePath, async (err, data) => {
      core.info(`Files count: ${data}`)

      const options = {
        attributeNamePrefix: '@_',
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
        attrValueProcessor: (val: string, attrName: string) =>
          he.decode(val, {isAttributeValue: true}), //default is a=>a
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        tagValueProcessor: (val: string, tagName: string) => he.decode(val), //default is a=>a
        stopNodes: ['parse-me-as-string']
      }

      if (xmlParser.validate(data.toString()) === true) {
        const jsonObj = xmlParser.parse(data.toString(), options, true)
        core.info(jsonObj)
        return JSON.stringify(jsonObj)
      }
    })
  } else {
    core.error('file doesnt exist')
  }
  return '{}'
}
