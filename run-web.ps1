param([ValidateSet('dev', 'build', 'test', 'start', 'preview')][string]$Task = 'dev')
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot

# Normal Node installations supply npm.cmd. The local agent bootstrap is a fallback
# for the current machine, whose bundled Node runtime does not put npm on PATH.
if (-not (Get-Command npm.cmd -ErrorAction SilentlyContinue)) {
    $localNpmShim = Join-Path $PSScriptRoot '.tools\shims'
    if (Test-Path -LiteralPath (Join-Path $localNpmShim 'npm.cmd')) {
        $env:PATH = "$localNpmShim;$env:PATH"
    } else {
        throw 'Install Node.js 22.12+ with npm, then reopen the terminal.'
    }
}
if (-not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'node_modules'))) {
    & npm.cmd install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
& npm.cmd run $Task
exit $LASTEXITCODE
