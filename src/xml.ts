import * as fs from 'fs'
import * as path from 'path'

import * as uitl from 'util'

export async function getTrxFiles(trxPath: string): Promise<string[]> {
  // TODO: Convert to async version    
  const files = fs.readdirSync(path.resolve(trxPath), {withFileTypes: true})  
  const readdir = uitl.promisify(fs.readdir)
  let fileNames = (await readdir(trxPath))
  let trxFiles = fileNames.filter(f => f.endsWith('.json'))
  
  return trxFiles
}
