import * as fs from 'fs'
export async function getTrxFiles(path: string): Promise<string[]> {
  // TODO: Convert to async version
  const files = fs.readdirSync(path)

  return files
}
