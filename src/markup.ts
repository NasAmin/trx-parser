import {Results, TrxDataWrapper, UnitTest, UnitTestResult} from './types/types'

export function getMarkupForTrx(testData: TrxDataWrapper, onlyFailed: boolean): string {
  return `
# Test Results - ${testData.ReportMetaData.ReportTitle}
${getTestTimes(testData)}
${getTestCounters(testData)}
${getTestResultsMarkup(testData, onlyFailed)}
`
}

export function getTestRunDuration(startTime: Date, endTime: Date): number {
  const startTimeSeconds = new Date(startTime).valueOf()
  const endTimeSeconds = new Date(endTime).valueOf()
  const duration = endTimeSeconds - startTimeSeconds
  return duration / 1000
}

function getTestTimes(testData: TrxDataWrapper): string {
  const duration = getTestRunDuration(
    testData.TrxData.TestRun.Times._start,
    testData.TrxData.TestRun.Times._finish
  )
  return `
<p>Expand the following summaries for more details:</p>
<details>  
  <summary> Duration: ${duration} seconds </summary>
  <table>
    <tr>
        <th>Started:</th>
        <td><code>${testData.TrxData.TestRun.Times._start}</code></td>
    </tr>
    <tr>
        <th>Creation:</th>
        <td><code>${testData.TrxData.TestRun.Times._finish}</code></td>
    </tr>
    <tr>
        <th>Queuing:</th>
        <td><code>${testData.TrxData.TestRun.Times._queuing}</code></td>
    </tr>
    <tr>
        <th>Finished:</th>
        <td><code>${testData.TrxData.TestRun.Times._finish}</code></td>    
    </tr>
    <tr>
        <th>Duration:</th>
        <td><code>${duration} seconds</code></td>
    </tr>

  </table>
</details>
`
}

function getTestCounters(testData: TrxDataWrapper): string {
  return `
<details>
  <summary> Outcome: ${testData.TrxData.TestRun.ResultSummary._outcome} | Total Tests: ${testData.TrxData.TestRun.ResultSummary.Counters._total} | Passed: ${testData.TrxData.TestRun.ResultSummary.Counters._passed} | Failed: ${testData.TrxData.TestRun.ResultSummary.Counters._failed} </summary>
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

function getTestResultsMarkup(testData: TrxDataWrapper, onlyFailed:boolean): string {
  let resultsMarkup = ''
  const unittests = testData.TrxData.TestRun.TestDefinitions.UnitTest

  if (Array.isArray(unittests)) {
    for (const data of unittests) {
      resultsMarkup += getSingletestMarkup(data, testData, onlyFailed)
    }
    return resultsMarkup.trim()
  } else {
    return getSingletestMarkup(unittests as UnitTest, testData, onlyFailed)
  }
}

function getSingletestMarkup(data: UnitTest, testData: TrxDataWrapper, onlyFailed: boolean): string {
  let resultsMarkup = ''
  const testResult = getUnitTestResult(
    data._id,
    testData.TrxData.TestRun.Results
  )

  if (testResult) {
    if (onlyFailed && testResult?._outcome == "Failed"){
      return resultsMarkup;
    }

    const testResultIcon = getTestOutcomeIcon(testResult?._outcome)
    let testMarkup = `
<details>
  <summary>${testResultIcon} ${data._name}</summary>    
  <table>
    <tr>
       <th>ID:</th>
       <td><code>${data._id}</code></td>
    </tr>
    <tr>
       <th>Name:</th>
       <td><code>${data._name}</code></td>
    </tr>
    <tr>
       <th>Outcome:</th>
       <td><code>${testResult._outcome}</code></td>
    </tr>
    <tr>
       <th>Computer Name:</th>
       <td><code>${testResult._computerName}</code></td>    
    </tr>
    <tr>
       <th>Start:</th>
       <td><code>${testResult._startTime}</code></td>
    </tr>
    <tr>
       <th>End:</th>
       <td><code>${testResult._endTime}</code></td>
    </tr>
    <tr>
       <th>Duration:</th>
       <td><code>${testResult._duration}</code></td>
    </tr>
  </table>

  <details>
      <summary> Test Method Details: </summary>
      <table>
        <tr>
          <th>Code Base</th>
          <td><code>${data.TestMethod._codeBase}</code></td>
        </tr>
        <tr>
          <th>Class Name</th>
          <td><code>${data.TestMethod._className}</code></td>
        </tr>
        <tr>
          <th>Method Name</th>
          <td><code>${data.TestMethod._name}</code></td>
        </tr>
      </table>      
  </details>
`

    if (testResult._outcome === 'Failed') {
      const failedTestDetails = `
  <details>
        <summary>Error Message:</summary>
        <pre>${testResult.Output?.ErrorInfo.Message}</pre>
  </details>
  <details>
        <summary>Stack Trace:</summary>
        <pre>${testResult.Output?.ErrorInfo.StackTrace}</pre>
  </details>
  `
      testMarkup += failedTestDetails
    }

    resultsMarkup += testMarkup
    resultsMarkup += `
</details>
`
  }
  return resultsMarkup.trim()
}

function getUnitTestResult(
  unitTestId: string,
  testResults: Results
): UnitTestResult | undefined {
  const unitTestResults = testResults.UnitTestResult

  if (Array.isArray(unitTestResults)) {
    return testResults.UnitTestResult.find(x => x._testId === unitTestId)
  }

  const result = unitTestResults as UnitTestResult
  return result
}

function getTestOutcomeIcon(testOutcome: string): string {
  if (testOutcome === 'Passed') return ':heavy_check_mark:'
  if (testOutcome === 'Failed') return ':x:'
  if (testOutcome === 'NotExecuted') return ':radio_button:'

  return ':grey_question:'
}
