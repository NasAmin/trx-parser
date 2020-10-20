import * as fs from 'fs'
import * as path from 'path'
import * as uitl from 'util'
import * as core from '@actions/core'

export async function getTrxFiles(trxPath: string): Promise<string[]> {
  // TODO: Convert to async version
  const files = fs.readdirSync(path.resolve(trxPath), {withFileTypes: true})
  const readdir = uitl.promisify(fs.readdir)
  const fileNames = await readdir(trxPath)
  const trxFiles = fileNames.filter(f => f.endsWith('.trx'))
  core.info(`Files count: ${files.length}`)
  const filesWithAbsolutePaths = getAbsoluteFilePaths(trxFiles, trxPath)
  return filesWithAbsolutePaths
}

export function getAbsoluteFilePaths(
  fileNames: string[],
  directoryName: string
): string[] {
  let absolutePaths: string[] = []
  fileNames.forEach(file => {
    const absolutePath = path.join(directoryName, file)
    absolutePaths.push(absolutePath)
  })

  return absolutePaths
}
