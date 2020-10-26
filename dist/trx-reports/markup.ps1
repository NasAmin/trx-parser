#!/usr/bin/env pwsh
param(    
    [string]$reportName=$null,
    [string]$reportTitle=$null,
    [Parameter(Mandatory)]
    [string]$trxPath,
    [string]$markupPath=$null
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

    "$PSScriptRoot/trx2md.ps1" -Verbose `
        -trxFile $trxPath `
        -mdFile $markupPath -xslParams @{
            reportTitle = $script:report_title
        }
}

Write-Output "Generating Markdown Report from TRX file"
Build-MarkdownReport
ls
if (Test-Path -Path $markupPath) {
    Get-Content -Path $markupPath    
}else {
    Write-Output 'Test report does not exist'
}
