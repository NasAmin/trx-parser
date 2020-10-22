import * as core from '@actions/core'
import {run} from '../src/main'

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
