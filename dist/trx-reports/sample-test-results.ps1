#!/usr/bin/env pwsh

function Build-MarkdownReport {
    $script:report_name = "abc"
    $script:report_title = "abc - name"

    if (-not $script:report_name) {
        $script:report_name = "TEST_RESULTS_$([datetime]::Now.ToString('yyyyMMdd_hhmmss'))"
    }
    if (-not $report_title) {
        $script:report_title = $report_name
    }

    $test_results_path = "$PSScriptRoot/trx-report/sample-test-results.trx"
    $test_report_path = "$PSScriptRoot/trx-report/sample-test-results.md"
    $script:test_report_path = Join-Path $tmpDir test-results.md
    & "$PSScriptRoot/trx-report/trx2md.ps1" -Verbose `
        -trxFile $script:test_results_path `
        -mdFile $script:test_report_path -xslParams @{
            reportTitle = $script:report_title
        }
}

Write-Output "Generating Markdown Report from TRX file"
Build-MarkdownReport