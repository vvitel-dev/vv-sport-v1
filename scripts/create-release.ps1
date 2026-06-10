param(
  [string]$Output = "vv-sport-v1-release.zip"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path ".git")) {
  throw "This release script must be run from the Git repository root."
}

git rev-parse --is-inside-work-tree | Out-Null

if (Test-Path $Output) {
  Remove-Item -LiteralPath $Output -Force
}

git archive --format=zip --output=$Output HEAD

Write-Host "Release archive created: $Output"
Write-Host "The .git directory is never included when using git archive."
