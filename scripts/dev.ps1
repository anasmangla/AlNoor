param(
  [switch]$Install
)

$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$script = Join-Path $here 'start-dev.ps1'
if (!(Test-Path $script)) { throw "start-dev.ps1 not found in scripts/" }

powershell -ExecutionPolicy Bypass -File $script @('
' + ($Install ? '-Install' : ''))

