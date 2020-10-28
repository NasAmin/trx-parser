import {getMarkupForTrx} from '../src//markup'

describe('Generate Gist for test reports', () => {
  test('Generate Markup gist', () => {
    const markup = getMarkupForTrx()
    console.log(markup)
    expect(true).toBeTruthy()
  })
})
