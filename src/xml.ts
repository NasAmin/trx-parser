import * as core from '@actions/core'
import * as fs from 'fs'
export async function getTrxFiles(path: string): Promise<string> {
  fs.readdir(path, (err, files) => {
    for (const file of files) {
      core.debug(file)
    }
  })
  return 'error'
}
