#!/usr/bin/env pwsh

param(    
    [string]$reportName=$null,
    [string]$reportTitle=$null,
    [Parameter(Mandatory)]
    [string]$trxPath,
    [string]$markupPath=$null
)

## You interface with the Actions/Workflow system by interacting
## with the environment.  The `GitHubActions` module makes this
## easier and more natural by wrapping up access to the Workflow
## environment in PowerShell-friendly constructions and idioms
if (-not (Get-Module -ListAvailable GitHubActions)) {
    ## Make sure the GH Actions module is installed from the Gallery
    Install-Module GitHubActions -Force
}

## Load up some common functionality for interacting
## with the GitHub Actions/Workflow environment
Import-Module GitHubActions

function Build-MarkdownReport {
    $script:report_name = $reportName
    $script:report_title = $reportTitle

    Write-ActionInfo "Report Name is: $reportName"
    Write-ActionInfo "Report Title is: $reportTitle"
    Write-ActionInfo "Trx Path is: $trxPath"
    Write-ActionInfo "Markup Path is: $markupPath"

    if (-not $script:report_name) {
        $script:report_name = "TEST_RESULTS_$([datetime]::Now.ToString('yyyyMMdd_hhmmss'))"
    }
    if (-not $report_title) {
        $script:report_title = $report_name
    }
    
    & "$PSScriptRoot/trx2md.ps1" -Verbose `
        -trxFile $trxPath `
        -mdFile $markupPath -xslParams @{
            reportTitle = $script:report_title
        }
}

Write-Output "Generating Markdown Report from TRX file"
Build-MarkdownReport

if (Test-Path -Path $markupPath) {
    Write-Output "Markup file $markupPath exists"        
}else {
    Write-Output 'Test report does not exist'
}
