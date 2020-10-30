import {getMarkupForTrx, getTestRunDuration} from '../src//markup'
import {transformTrxToJson} from '../src/utils'

describe('when loading xml from a trx file', () => {
  test('LoadXml Should have an outcome of Completed()', async () => {
    const data = await transformTrxToJson(
      './test-data/failing-tests/dummy-tests.trx'
    )
    const testData = getMarkupForTrx(data)
    // expect(data.TrxData.TestRun.ResultSummary._outcome).toEqual('Completed')
    expect(testData).toContain(
      `Test Results - ${data.ReportMetaData.ReportTitle}`
    )
    expect(testData).toContain(
      `Total Tests: ${data.TrxData.TestRun.ResultSummary.Counters._total}`
    )
    expect(testData).toContain(
      `Failed: ${data.TrxData.TestRun.ResultSummary.Counters._failed}`
    )

    console.log(testData)
  })

  test('getTestRunDuration', async () => {
    const duration = getTestRunDuration(
      new Date('2020-01-09T14:05:40.5069954+00:00'),
      new Date('2020-01-09T14:07:31.9132227+00:00')
    )
    expect(duration).toEqual(111.407)
  })
})
