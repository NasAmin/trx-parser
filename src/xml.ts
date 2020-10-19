import * as fs from 'fs'
export async function getTrxFiles(path: string) : Promise<string>{
    fs.readdir('.', (err, files) => {
        files.forEach(file => {
          console.log(file);
        });
      });
    return ""
}