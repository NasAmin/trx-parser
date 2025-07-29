import * as path from 'path'

import {getAbsoluteFilePaths, transformTrxToJson, areThereAnyFailingTests} from '../src/utils'

describe('Test GetAbsolutePath returns correct values', () => {
  it('getAbsoluteFilePaths()', async () => {
    const filesNames = ['abc.trx', 'xyz.trx']
    const dirName = path.normalize('/root/test-data')
    const expectedPaths = [
      path.normalize('/root/test-data/abc.trx'),
      path.normalize('/root/test-data/xyz.trx')
    ]

    const actualPaths = getAbsoluteFilePaths(filesNames, dirName)
    expect(actualPaths).toEqual(expectedPaths)
  })
})
describe('when loading xml from a trx file', () => {
  test('LoadXml Should have an outcome of Completed()', async () => {
    const data = await transformTrxToJson(
      './test-data/passing-tests/logger.trx'
    )
    expect(data.TrxData.TestRun.ResultSummary._outcome).toEqual('Completed')
    expect(data.TrxData.TestRun.ResultSummary.Counters._total).toEqual(21)
    expect(data.TrxData.TestRun.ResultSummary.Counters._passed).toEqual(10)
    expect(data.TrxData.TestRun.ResultSummary.Counters._passed).toEqual(
      data.TrxData.TestRun.ResultSummary.Counters._executed
    )
    expect(data.TrxData.TestRun.ResultSummary.Counters._failed).toEqual(0)
  })

  test('LoadXml Should have an outcome of Failed', async () => {
    const data = await transformTrxToJson(
      './test-data/failing-tests/dummy-tests.trx'
    )
    expect(data.TrxData.TestRun.ResultSummary._outcome).toEqual('Failed')
    expect(data.TrxData.TestRun.ResultSummary.Counters._total).toEqual(4)
    expect(data.TrxData.TestRun.ResultSummary.Counters._passed).toEqual(3)
    expect(data.TrxData.TestRun.ResultSummary.Counters._failed).toEqual(1)
  })

  test('Test Data with a single test', async () => {
    const data = await transformTrxToJson(
      './test-data/passing-tests/single-test.trx'
    )
    expect(data.TrxData.TestRun.ResultSummary._outcome).toEqual('Completed')
    expect(data.TrxData.TestRun.ResultSummary.Counters._total).toEqual(1)
    expect(data.TrxData.TestRun.ResultSummary.Counters._passed).toEqual(1)
    expect(data.TrxData.TestRun.ResultSummary.Counters._failed).toEqual(0)
  })

  test('Test Data with all passed tests but outcome Failed should not report failures', async () => {
    const data = await transformTrxToJson(
      './test-data/passing-tests/all-passed-but-outcome-failed.trx'
    )
    expect(data.TrxData.TestRun.ResultSummary._outcome).toEqual('Failed')
    expect(data.TrxData.TestRun.ResultSummary.Counters._total).toEqual(2)
    expect(data.TrxData.TestRun.ResultSummary.Counters._passed).toEqual(2)
    expect(data.TrxData.TestRun.ResultSummary.Counters._failed).toEqual(0)
  })
})

describe('areThereAnyFailingTests function', () => {
  test('should return false when outcome is Failed but failed count is 0', async () => {
    const data = await transformTrxToJson(
      './test-data/passing-tests/all-passed-but-outcome-failed.trx'
    )
    const result = areThereAnyFailingTests([data])
    expect(result).toBe(false)
  })

  test('should return true when there are actual failed tests', async () => {
    const data = await transformTrxToJson(
      './test-data/failing-tests/dummy-tests.trx'
    )
    const result = areThereAnyFailingTests([data])
    expect(result).toBe(true)
  })

  test('should return false when all tests pass', async () => {
    const data = await transformTrxToJson(
      './test-data/passing-tests/single-test.trx'
    )
    const result = areThereAnyFailingTests([data])
    expect(result).toBe(false)
  })

  test('should handle multiple trx files correctly', async () => {
    const passingData = await transformTrxToJson(
      './test-data/passing-tests/single-test.trx'
    )
    const failedOutcomeButPassedTests = await transformTrxToJson(
      './test-data/passing-tests/all-passed-but-outcome-failed.trx'
    )
    
    // Both files have no actual failed tests, should return false
    const result = areThereAnyFailingTests([passingData, failedOutcomeButPassedTests])
    expect(result).toBe(false)
  })

  test('should return true if any trx file has failed tests', async () => {
    const passingData = await transformTrxToJson(
      './test-data/passing-tests/single-test.trx'
    )
    const actuallyFailingData = await transformTrxToJson(
      './test-data/failing-tests/dummy-tests.trx'
    )
    
    // One file has actual failed tests, should return true
    const result = areThereAnyFailingTests([passingData, actuallyFailingData])
    expect(result).toBe(true)
  })
})
