import {getMarkupForTrx, getTestRunDuration} from '../src//markup'

import {transformTrxToJson} from '../src/utils'

describe('When generating markup for trx', () => {
  test('LoadXml Should have an outcome of Failed()', async () => {
    const data = await transformTrxToJson(
      './test-data/failing-tests/dummy-tests.trx'
    )
    const testData = getMarkupForTrx(data)
    expect(data.TrxData.TestRun.ResultSummary._outcome).toEqual('Failed')
    expect(testData).toContain(
      `Test Results - ${data.ReportMetaData.ReportTitle}`
    )
    expect(testData).toContain(
      `Total Tests: ${data.TrxData.TestRun.ResultSummary.Counters._total}`
    )
    expect(testData).toContain(
      `Failed: ${data.TrxData.TestRun.ResultSummary.Counters._failed}`
    )

    expect(testData).toContain(data.ReportMetaData.ReportTitle)

    expect(testData).toContain(data.TrxData.TestRun.Times._start)
    expect(testData).toContain(data.TrxData.TestRun.Times._finish)

    // console.log(testData)
  })

  test('LoadXml For single test()', async () => {
    const data = await transformTrxToJson(
      './test-data/passing-tests/single-test.trx'
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

    expect(testData).toContain(data.ReportMetaData.ReportTitle)

    expect(testData).toContain(data.TrxData.TestRun.Times._start)
    expect(testData).toContain(data.TrxData.TestRun.Times._finish)

    // console.log(testData)
  })

  test('getTestRunDuration()', () => {
    const duration = getTestRunDuration(
      new Date('2020-01-09T14:05:40.5069954+00:00'),
      new Date('2020-01-09T14:07:31.9132227+00:00')
    )
    expect(duration).toEqual(111.407)
  })
})

describe('When reading invalid trx file', () => {
  test('Load trx with test host error', async () => {
    const data = await transformTrxToJson(
      './test-data/failing-tests/test-host-error.trx'
    )
    const testData = getMarkupForTrx(data)
    expect(data.TrxData.TestRun.ResultSummary._outcome).toEqual('Failed')
    expect(testData).toContain(
      `Test Results - ${data.ReportMetaData.ReportTitle}`
    )
    expect(testData).toContain(
      `Total Tests: ${data.TrxData.TestRun.ResultSummary.Counters._total}`
    )
    expect(testData).toContain(
      `Failed: ${data.TrxData.TestRun.ResultSummary.Counters._failed}`
    )
  })

  test('Parse trx with zero unit tests', async () => {
    const data = await transformTrxToJson(
      './test-data/failing-tests/no-tests.trx'
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
  })
})
