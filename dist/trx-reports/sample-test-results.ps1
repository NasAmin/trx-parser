
#$xslFile = "$PSScriptRoot\example.xsl"
#$xmlFile = "$PSScriptRoot\example.xml"
#$outFile = "$PSScriptRoot\example.out"
Write-Output 'Starting transformation'
$xslFile = Resolve-Path -Path "$PSScriptRoot\trx2md.xsl"
$xmlFile = Resolve-Path -Path "$PSScriptRoot\sample-test-results.trx"
$outFile = "$PSScriptRoot\sample-test.results.md"

class TrxFn {
    [double]DiffSeconds([datetime]$from, [datetime]$till) {
        return ($till - $from).TotalSeconds
    }
}


if (-not $script:xslt) {
    $script:urlr = [System.Xml.XmlUrlResolver]::new()
    $script:opts = [System.Xml.Xsl.XsltSettings]::new()
    #$script:opts.EnableScript = $true
    $script:xslt = [System.Xml.Xsl.XslCompiledTransform]::new()
    try {
        $script:xslt.Load($xslFile, $script:opts, $script:urlr)
    }
    catch {
        $Error[0]
        return
    }
}

$script:list = [System.Xml.Xsl.XsltArgumentList]::new()
$script:list.AddExtensionObject("urn:trxfn", [TrxFn]::new())
$script:wrtr = [System.IO.StreamWriter]::new($outFile)
try {
    Write-Output 'Writing file'
    $script:xslt.Transform(
        [string]$xmlFile,
        [System.Xml.Xsl.XsltArgumentList]$script:list,
        [System.IO.TextWriter]$script:wrtr)
}
finally {
    $script:wrtr.Dispose()
}

Write-Output 'MD file created, view content below'
$resolvedOutFile = Resolve-Path -Path $outFile
cat $resolvedOutFile
ls