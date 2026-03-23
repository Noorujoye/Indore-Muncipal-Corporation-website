param(
  [string]$DbHost = "localhost",
  [int]$DbPort = 5432,
  [string]$DbName = "imc_vms",
  [string]$DbUser = "postgres"
)

$ErrorActionPreference = "Stop"

function Read-PlainTextSecret([string]$Prompt) {
  $secure = Read-Host $Prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

$pw = Read-PlainTextSecret "Enter PostgreSQL password for user '$DbUser'"
$env:PGPASSWORD = $pw

Write-Host "Resetting schema 'public' in database '$DbName'..." -ForegroundColor Cyan

$cmd = @"
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO $DbUser;
GRANT ALL ON SCHEMA public TO public;
"@

psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -v ON_ERROR_STOP=1 -c $cmd

Write-Host "Done. Now restart backend; tables/users will be recreated." -ForegroundColor Green
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue
