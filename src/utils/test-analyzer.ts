import {TrxDataWrapper} from '../types/types'

/**
 * Check if there are any failing tests across all TRX reports
 */
export function areThereAnyFailingTests(
  trxJsonReports: TrxDataWrapper[]
): boolean {
  return trxJsonReports.some(
    trxData => trxData.TrxData.TestRun?.ResultSummary?._outcome === 'Failed'
  )
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
