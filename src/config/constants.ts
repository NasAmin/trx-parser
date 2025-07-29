/**
 * Configuration constants for the TRX parser
 */

export const XML_PARSER_OPTIONS = {
  attributeNamePrefix: '_',
  textNodeName: '#text',
  ignoreAttributes: false,
  ignoreNameSpace: false,
  allowBooleanAttributes: true,
  parseNodeValue: true,
  parseAttributeValue: true,
  trimValues: true,
  format: true,
  indentBy: '  ',
  supressEmptyNode: false,
  rootNodeName: 'element',
  cdataTagName: '__cdata',
  cdataPositionChar: '\\c',
  parseTrueNumberOnly: false,
  arrayMode: false,
  stopNodes: ['parse-me-as-string']
}

export const XML_VALIDATOR_OPTIONS = {
  allowBooleanAttributes: true
}

export const TEST_OUTCOMES = {
  PASSED: 'Passed',
  FAILED: 'Failed',
  NOT_EXECUTED: 'NotExecuted',
  ERROR: 'Error'
} as const

export const BADGE_COLORS = {
  SUCCESS: 'brightgreen',
  FAILURE: 'red'
} as const

export const TEST_OUTCOME_ICONS = {
  [TEST_OUTCOMES.PASSED]: ':heavy_check_mark:',
  [TEST_OUTCOMES.FAILED]: ':x:',
  [TEST_OUTCOMES.ERROR]: ':x:',
  [TEST_OUTCOMES.NOT_EXECUTED]: ':radio_button:',
  DEFAULT: ':grey_question:'
} as const
