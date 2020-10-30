import {getMarkupForTrx} from '../src//markup'
import {transformTrxToJson} from '../src/utils'

describe('when loading xml from a trx file', () => {
  test('LoadXml Should have an outcome of Completed()', async () => {
    const data = await transformTrxToJson(
      './test-data/passing-tests/auditlog.trx'
    )
    const testData = getMarkupForTrx(data)
    expect(data.TrxData.TestRun.ResultSummary._outcome).toEqual('Completed')
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
})
