import * as fs from 'fs'
import * as path from 'path'
import * as util from 'util'
import {promises} from 'fs'

/**
 * Get all TRX files from a directory
 */
export async function getTrxFiles(trxPath: string): Promise<string[]> {
  // Resolve and normalize the path to prevent traversal attacks
  const resolvedTrxPath = path.resolve(trxPath)

  if (!fs.existsSync(resolvedTrxPath)) return []

  const readdir = util.promisify(fs.readdir)
  const fileNames = await readdir(resolvedTrxPath)
  const trxFiles = fileNames.filter(
    f => f.endsWith('.trx') && !f.includes('..')
  )

  return getAbsoluteFilePaths(trxFiles, resolvedTrxPath)
}

/**
 * Convert relative file paths to absolute paths with path traversal protection
 */
export function getAbsoluteFilePaths(
  fileNames: string[],
  directoryName: string
): string[] {
  const resolvedDirectory = path.resolve(directoryName)

  return fileNames
    .filter(file => {
      // Prevent path traversal attacks
      if (file.includes('..') || file.includes('/') || file.includes('\\')) {
        return false
      }
      return true
    })
    .map(file => {
      const fullPath = path.join(resolvedDirectory, file)
      const resolvedPath = path.resolve(fullPath)

      // Ensure the resolved path is within the intended directory
      if (
        !resolvedPath.startsWith(resolvedDirectory + path.sep) &&
        resolvedPath !== resolvedDirectory
      ) {
        throw new Error(`Path traversal attempt detected: ${file}`)
      }

      return resolvedPath
    })
}

/**
 * Read a TRX file and return its contents as a string with path validation
 */
export async function readTrxFile(filePath: string): Promise<string> {
  // Resolve the file path to prevent directory traversal
  const resolvedPath = path.resolve(filePath)

  // Additional security check to ensure it's a .trx file
  if (!resolvedPath.endsWith('.trx')) {
    throw new Error(
      `Invalid file type. Only .trx files are allowed: ${filePath}`
    )
  }

  // Verify the file exists and is readable
  try {
    await promises.access(resolvedPath, fs.constants.R_OK)
  } catch (error) {
    throw new Error(
      `Cannot read file: ${filePath}. ${(error as Error).message}`
    )
  }

  return await promises.readFile(resolvedPath, 'utf8')
}
