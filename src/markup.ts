import * as fs from 'fs'
import {promises} from 'fs'
import {TrxDataWrapper} from './types/types'

export function getMarkupForTrx(testData: TrxDataWrapper): string {
  const startTime = new Date(testData.TrxData.TestRun.Times._start).getSeconds()
  const endTime = new Date(testData.TrxData.TestRun.Times._finish).getSeconds()
  const duration = startTime - endTime
  return `
# Test Results - ${testData.ReportMetaData.ReportTitle}
<p>Expand the following summaries for more details:</p>
<details>  
  <summary> Duration: ${duration} seconds </summary>
  <table>
    <tr>
       <th>Started:</th>
       <td>${testData.TrxData.TestRun.Times._start}</td>
    </tr>
    <tr>
       <th>Creation:</th>
       <td>${testData.TrxData.TestRun.Times._finish}</td>
    </tr>
    <tr>
       <th>Queuing:</th>
       <td>\`\`\`${testData.TrxData.TestRun.Times._queuing}\`\`\`</td>
    </tr>
    <tr>
       <th>Finished:</th>
       <td>${testData.TrxData.TestRun.Times._finish}</td>    
    </tr>
    <tr>
       <th>Duration:</th>
       <td>${duration}</td>
    </tr>

  </table>
</details>
`
}

export async function getMarkupForTrxFromGist(
  markupPath: string
): Promise<string> {
  let markup = ''
  if (fs.existsSync(markupPath)) {
    markup = await promises.readFile(markupPath, 'utf8')
  }
  return markup
}
