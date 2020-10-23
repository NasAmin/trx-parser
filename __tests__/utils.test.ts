import * as path from 'path'
import {getAbsoluteFilePaths, transformTrxToJson} from '../src/utils'
import {generateMarkupFile} from '../src/test-reporter'

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
      './test-data/passing-tests/auditlog.trx'
    )
    expect(data.TestRun.ResultSummary._outcome).toEqual('Completed')
    expect(data.TestRun.ResultSummary.Counters._total).toEqual(21)
    expect(data.TestRun.ResultSummary.Counters._passed).toEqual(10)
    expect(data.TestRun.ResultSummary.Counters._passed).toEqual(
      data.TestRun.ResultSummary.Counters._executed
    )
    expect(data.TestRun.ResultSummary.Counters._failed).toEqual(0)
  })

  test('LoadXml Should have an outcome of Failed', async () => {
    const data = await transformTrxToJson(
      './test-data/failing-tests/dummy-tests.trx'
    )
    expect(data.TestRun.ResultSummary._outcome).toEqual('Failed')
    expect(data.TestRun.ResultSummary.Counters._total).toEqual(4)
    expect(data.TestRun.ResultSummary.Counters._passed).toEqual(3)
    expect(data.TestRun.ResultSummary.Counters._failed).toEqual(1)
  })
})

describe('Generate Gist for test reports', () => {
  test('Generate Markup gist', async () => {
    await generateMarkupFile('abc', 'xyz')
    expect(true).toBeTruthy()
  })
})
