import * as fs from 'fs'
import * as path from 'path'
import * as uitl from 'util'
import * as core from '@actions/core'

export async function getTrxFiles(trxPath: string): Promise<string[]> {
  // TODO: Convert to async version
  const files = fs.readdirSync(path.resolve(trxPath), {withFileTypes: true})
  const readdir = uitl.promisify(fs.readdir)
  const fileNames = await readdir(trxPath)
  const trxFiles = fileNames.filter(f => f.endsWith('.json'))
  core.info(`Files count: ${files.length}`)

  return trxFiles
}
