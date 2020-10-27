import * as fs from 'fs'
import {promises} from 'fs'

export function getMarkupForTrx(): string {
  return `
# Test Results - Staging Tests
<p>Expand the following summaries for more details:</p>
<details>
   <summary>Duration: 0.7564394 seconds </summary>
   <table>
      <tr>
         <th>Detected Status</th>
         <td>Closed</td>
         <td>:x:</td>
      </tr>
      <tr>
         <th>Allowed Statuses</th>
         <td>Assessment, Open</td>
         <td>:heavy_check_mark:</td>
      </tr>
   </table>
</details>
<p>Please ensure your jira story is in one of the allowed statuses</p>`.trimLeft()
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
