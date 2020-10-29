import * as fs from 'fs'
import {promises} from 'fs'
import {TrxDataWrapper} from './types/types'

export function getMarkupForTrx(testData: TrxDataWrapper): string {
  return `
# Test Results - \`${testData.ReportMetaData.ReportTitle}\`
<p>Expand the following summaries for more details:</p>
<details>;
    <summary Duration: blah seconds
    </summary>
| **Times** | |
|--|--|
| **Started:**  | \`heh\` |
| **Creation:** | \`beh\` 
| **Queuing:**  | \`ha\`
| **Finished:** | \`help\` |
| **Duration:** | \`time\` seconds |

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
