import {Results, TrxDataWrapper, UnitTest, UnitTestResult} from '../types/types'
import {
  BADGE_COLORS,
  TEST_OUTCOME_ICONS,
  TEST_OUTCOMES
} from '../config/constants'

/**
 * Generate markup report for TRX test data
 */
export function getMarkupForTrx(testData: TrxDataWrapper): string {
  const failedCount = testData.TrxData.TestRun.ResultSummary.Counters._failed
  const passedCount = testData.TrxData.TestRun.ResultSummary.Counters._passed
  const totalCount = testData.TrxData.TestRun.ResultSummary.Counters._total
  const testOutcome = testData.TrxData.TestRun.ResultSummary._outcome

  const badgeCountText =
    failedCount > 0
      ? `${`${failedCount}/${totalCount}`}`
      : `${`${passedCount}/${totalCount}`}`

  const badgeStatusText =
    failedCount > 0 || testOutcome === 'Failed' ? 'FAILED' : 'PASSED'

  const badgeColor =
    failedCount > 0 || testOutcome === 'Failed'
      ? BADGE_COLORS.FAILURE
      : BADGE_COLORS.SUCCESS

  return `
![Generic badge](https://img.shields.io/badge/${badgeCountText}-${badgeStatusText}-${badgeColor}.svg)
# Test Results - ${testData.ReportMetaData.ReportTitle}
${getTestTimes(testData)}
${getTestCounters(testData)}
${getTestResultsMarkup(testData)}
`
}

/**
 * Calculate test run duration in seconds
 */
export function getTestRunDuration(startTime: Date, endTime: Date): number {
  const startTimeSeconds = new Date(startTime).valueOf()
  const endTimeSeconds = new Date(endTime).valueOf()
  const duration = endTimeSeconds - startTimeSeconds
  return duration / 1000
}

/**
 * Generate test timing information markup
 */
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

/**
 * Generate test counters markup
 */
function getTestCounters(testData: TrxDataWrapper): string {
  const counters = testData.TrxData.TestRun.ResultSummary.Counters
  return `
<details>
  <summary> Outcome: ${testData.TrxData.TestRun.ResultSummary._outcome} | Total Tests: ${counters._total} | Passed: ${counters._passed} | Failed: ${counters._failed} </summary>
  <table>
    <tr>
       <th>Total:</th>
       <td>${counters._total}</td>
    </tr>
    <tr>
       <th>Executed:</th>
       <td>${counters._executed}</td>
    </tr>
    <tr>
       <th>Passed:</th>
       <td>${counters._passed}</td>
    </tr>
    <tr>
       <th>Failed:</th>
       <td>${counters._failed}</td>    
    </tr>
    <tr>
       <th>Error:</th>
       <td>${counters._error}</td>
    </tr>
    <tr>
       <th>Timeout:</th>
       <td>${counters._timeout}</td>
    </tr>
    <tr>
       <th>Aborted:</th>
       <td>${counters._aborted}</td>
    </tr>
    <tr>
       <th>Inconclusive:</th>
       <td>${counters._inconclusive}</td>
    </tr>
    <tr>
       <th>PassedButRunAborted:</th>
       <td>${counters._passedButRunAborted}</td>
    </tr>
    <tr>
       <th>NotRunnable:</th>
       <td>${counters._notRunnable}</td>
    </tr>
    <tr>
       <th>NotExecuted:</th>
       <td>${counters._notExecuted}</td>
    </tr>
    <tr>
       <th>Disconnected:</th>
       <td>${counters._disconnected}</td>
    </tr>
    <tr>
       <th>Warning:</th>
       <td>${counters._warning}</td>
    </tr>
    <tr>
       <th>Completed:</th>
       <td>${counters._completed}</td>
    </tr>
    <tr>
       <th>InProgress:</th>
       <td>${counters._inProgress}</td>
    </tr>
    <tr>
       <th>Pending:</th>
       <td>${counters._pending}</td>
    </tr>
  </table>
</details>
`
}

/**
 * Generate test results markup
 */
function getTestResultsMarkup(testData: TrxDataWrapper): string {
  if (testData.IsEmpty) {
    return getNoResultsMarkup(testData)
  }

  const unittests = testData.TrxData.TestRun.TestDefinitions.UnitTest
  if (Array.isArray(unittests)) {
    return unittests
      .map(data => getSingleTestMarkup(data, testData))
      .join('')
      .trim()
  } else {
    return getSingleTestMarkup(unittests as UnitTest, testData)
  }
}

/**
 * Generate markup for when no test results are available
 */
function getNoResultsMarkup(testData: TrxDataWrapper): string {
  const runInfo = testData.TrxData.TestRun.ResultSummary.RunInfos.RunInfo
  const testResultIcon = getTestOutcomeIcon(runInfo._outcome)
  return `
<details>
  <summary>${testResultIcon} ${runInfo._computerName}</summary> 

  <table>
    <tr>
      <th>Run Info</th>
      <td><code>${runInfo.Text}</code></td>
    </tr>
  </table>      
  </details>
`
}

/**
 * Generate markup for a single test
 */
function getSingleTestMarkup(data: UnitTest, testData: TrxDataWrapper): string {
  const testResult = getUnitTestResult(
    data._id,
    testData.TrxData.TestRun.Results
  )

  // Only show failed tests to reduce noise
  if (!testResult || testResult._outcome !== TEST_OUTCOMES.FAILED) {
    return ''
  }

  const testResultIcon = getTestOutcomeIcon(testResult._outcome)
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

  if (testResult._outcome === TEST_OUTCOMES.FAILED) {
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

  testMarkup += `
</details>
`
  return testMarkup.trim()
}

/**
 * Find a unit test result by test ID
 */
function getUnitTestResult(
  unitTestId: string,
  testResults: Results
): UnitTestResult | undefined {
  const unitTestResults = testResults.UnitTestResult

  if (Array.isArray(unitTestResults)) {
    return unitTestResults.find(x => x._testId === unitTestId)
  }

  const result = unitTestResults as UnitTestResult
  return result
}

/**
 * Get appropriate icon for test outcome
 */
function getTestOutcomeIcon(testOutcome: string): string {
  return (
    TEST_OUTCOME_ICONS[testOutcome as keyof typeof TEST_OUTCOME_ICONS] ??
    TEST_OUTCOME_ICONS.DEFAULT
  )
}
