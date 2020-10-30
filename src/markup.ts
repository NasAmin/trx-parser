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
       <td>${testData.TrxData.TestRun.Times._queuing}</td>
    </tr>
    <tr>
       <th>Finished:</th>
       <td>${testData.TrxData.TestRun.Times._finish}</td>    
    </tr>
    <tr>
       <th>Duration:</th>
       <td>${duration} seconds</td>
    </tr>

  </table>
</details>
<details>  
  <summary> Outcome: ${testData.TrxData.TestRun.ResultSummary._outcome} | Total Tests: ${testData.TrxData.TestRun.ResultSummary.Counters._total} | Failed: ${testData.TrxData.TestRun.ResultSummary.Counters._failed} </summary>
  <table>
    <tr>
       <th>Total:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._total}</td>
    </tr>
    <tr>
       <th>Executed:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._executed}</td>
    </tr>
    <tr>
       <th>Passed:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._passed}</td>
    </tr>
    <tr>
       <th>Failed:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._failed}</td>    
    </tr>
    <tr>
       <th>Error:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._error}</td>
    </tr>
    <tr>
       <th>Timeout:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._timeout}</td>
    </tr>
    <tr>
       <th>Aborted:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._aborted}</td>
    </tr>
    <tr>
       <th>Inconclusive:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._inconclusive}</td>
    </tr>
    <tr>
       <th>PassedButRunAborted:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._passedButRunAborted}</td>
    </tr>
    <tr>
       <th>NotRunnable:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._notRunnable}</td>
    </tr>
    <tr>
       <th>NotExecuted:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._notExecuted}</td>
    </tr>
    <tr>
       <th>Disconnected:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._disconnected}</td>
    </tr>
    <tr>
       <th>Warning:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._warning}</td>
    </tr>
    <tr>
       <th>Completed:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._completed}</td>
    </tr>
    <tr>
       <th>InProgress:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._inProgress}</td>
    </tr>
    <tr>
       <th>Pending:</th>
       <td>${testData.TrxData.TestRun.ResultSummary.Counters._pending}</td>
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
