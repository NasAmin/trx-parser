import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import {promises} from 'fs'

/**
 * Get all TRX files from a directory
 */
export async function getTrxFiles(trxPath: string): Promise<string[]> {
  if (!fs.existsSync(trxPath)) return []

  const readdir = util.promisify(fs.readdir)
  const fileNames = await readdir(trxPath)
  const trxFiles = fileNames.filter(f => f.endsWith('.trx'))

  return getAbsoluteFilePaths(trxFiles, trxPath)
}

/**
 * Convert relative file paths to absolute paths
 */
export function getAbsoluteFilePaths(
  fileNames: string[],
  directoryName: string
): string[] {
  return fileNames.map(file => path.join(directoryName, file))
}

/**
 * Read a TRX file and return its contents as a string
 */
export async function readTrxFile(filePath: string): Promise<string> {
  return await promises.readFile(filePath, 'utf8')
}
