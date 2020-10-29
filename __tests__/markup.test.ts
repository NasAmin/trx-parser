import {getMarkupForTrx} from '../src//markup'
import {transformTrxToJson} from '../src/utils'

describe('when loading xml from a trx file', () => {
  test('LoadXml Should have an outcome of Completed()', async () => {
    const data = await transformTrxToJson(
      './test-data/passing-tests/auditlog.trx'
    )
    const testData = getMarkupForTrx(data)
    expect(data.TrxData.TestRun.ResultSummary._outcome).toEqual('Completed')
    console.log(testData)
  })
})
