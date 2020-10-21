import * as core from '@actions/core'
import {run} from '../src/main'
import {getAbsoluteFilePaths, loadXmlFile} from '../src/utils'
jest.mock('@actions/core')

describe('When parsing tests', () => {
  const fakeSetOutput = core.setOutput as jest.MockedFunction<
    typeof core.setOutput
  >

  test('Test outcome should be set to Passed', async () => {
    await run()
    expect(fakeSetOutput).toHaveBeenCalledWith(
      'test-outcome',
      expect.anything()
    )
  })
})

describe('Test GetAbsolutePath returns correct values', () => {
  it('getAbsoluteFilePaths()', async () => {
    const filesNames = ['abc.trx', 'xyz.trx']
    const dirName = '/root/test-data'
    const expectedPaths = ['/root/test-data/abc.trx', '/root/test-data/xyz.trx']
    const actualPaths = getAbsoluteFilePaths(filesNames, dirName)
    expect(actualPaths).toEqual(expectedPaths)
  })
})

describe('when loading xml from a trx file', () => {
  it('LoadXml Should have an outcome of Completed()', async () => {
    var data = await loadXmlFile(
      './test-data/_staging-tests-tktr8_2020-10-09_13_04_50.trx'
    )
    console.log(data.TestRun._id)
    expect(data.TestRun.ResultSummary._outcome).toEqual('Completed')
    expect(data.TestRun.ResultSummary.Counters._total).toEqual(4)
    expect(data.TestRun.ResultSummary.Counters._passed).toEqual(4)
    expect(data.TestRun.ResultSummary.Counters._failed).toEqual(0)
  })
})
