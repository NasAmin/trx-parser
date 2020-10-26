export interface Times {
  _creation: Date
  _queuing: Date
  _start: Date
  _finish: Date
}

export interface Deployment {
  _runDeploymentRoot: string
}

export interface TestSettings {
  _name: string
  _id: string
  Deployment: Deployment
}

export interface UnitTestResult {
  _executionId: string
  _testId: string
  _testName: string
  _computerName: string
  _duration: string
  _startTime: Date
  _endTime: Date
  _testType: string
  _outcome: string
  _testListId: string
  _relativeResultsDirectory: string
}

export interface Results {
  UnitTestResult: UnitTestResult[]
}

export interface Execution {
  _id: string
}

export interface TestMethod {
  _codeBase: string
  _adapterTypeName: string
  _className: string
  _name: string
}

export interface UnitTest {
  _name: string
  _storage: string
  _id: string
  Execution: Execution
  TestMethod: TestMethod
}

export interface TestDefinitions {
  UnitTest: UnitTest[]
}

export interface TestEntry {
  _testId: string
  _executionId: string
  _testListId: string
}

export interface TestEntries {
  TestEntry: TestEntry[]
}

export interface TestList {
  _name: string
  _id: string
}

export interface TestLists {
  TestList: TestList[]
}

export interface Counters {
  _total: number
  _executed: number
  _passed: number
  _failed: number
  _error: number
  _timeout: number
  _aborted: number
  _inconclusive: number
  _passedButRunAborted: number
  _notRunnable: number
  _notExecuted: number
  _disconnected: number
  _warning: number
  _completed: number
  _inProgress: number
  _pending: number
}

export interface ResultSummary {
  _outcome: string
  Counters: Counters
}

export interface TestRun {
  _id: string
  _name: string
  _xmlns: string
  Times: Times
  TestSettings: TestSettings
  Results: Results
  TestDefinitions: TestDefinitions
  TestEntries: TestEntries
  TestLists: TestLists
  ResultSummary: ResultSummary
}

export interface TrxData {
  TestRun: TestRun
}

export interface TrxDataWrapper {
  TestRun: TestRun
  ReportMetaData: {
    TrxFilePath: string
    MarkupFilePath: string
    ReportName: string
    ReportTitle: string
    TrxXmlString: string
    TrxJSonString: string
  }
}
