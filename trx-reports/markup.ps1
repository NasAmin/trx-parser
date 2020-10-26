#!/usr/bin/env pwsh
param(
    $reportName,
    $reportTitle,
    $trxPath,
    $markupPath
)

function Build-MarkdownReport {
    $script:report_name = $reportName
    $script:report_title = $reportTitle

    if (-not $script:report_name) {
        $script:report_name = "TEST_RESULTS_$([datetime]::Now.ToString('yyyyMMdd_hhmmss'))"
    }
    if (-not $report_title) {
        $script:report_title = $report_name
    }

    $test_results_path = $trxPath
    $test_report_path = $markupPath
    & "$PSScriptRoot/trx2md.ps1" -Verbose `
        -trxFile $test_results_path `
        -mdFile $test_report_path -xslParams @{
            reportTitle = $script:report_title
        }
}

Write-Output "Generating Markdown Report from TRX file"
Build-MarkdownReport
ls
if (Test-Path -Path $test_report_path) {
    Get-Content -Path $test_report_path    
}else {
    Write-Output 'Test report does not exist'
}
