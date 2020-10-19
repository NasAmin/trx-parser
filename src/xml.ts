import * as fs from 'fs'
export async function getTrxFiles(path: string) : Promise<string>{
    fs.readdir(path, (err, files) => {
        files.forEach(file => {
          console.log(file);
        });
      });
    return "error"
}