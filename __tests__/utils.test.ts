import * as path from 'path'
import {getAbsoluteFilePaths, transformTrxToJson} from '../src/utils'

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
      './test-data/_staging-tests-tktr8_2020-10-09_13_04_50.trx'
    )

    expect(data.TestRun.ResultSummary._outcome).toEqual('Completed')
    expect(data.TestRun.ResultSummary.Counters._total).toEqual(4)
    expect(data.TestRun.ResultSummary.Counters._passed).toEqual(4)
    expect(data.TestRun.ResultSummary.Counters._failed).toEqual(0)
  })
})
