param(
  [string]$DbHost = "localhost",
  [int]$DbPort = 5432,
  [string]$DbName = "imc_vms",
  [string]$DbUser = "postgres",
  [string]$FrontendOrigin = "http://localhost:5173",
  [string]$TestEmailTo = ""
)

$ErrorActionPreference = "Stop"

function Read-PlainTextSecret([string]$Prompt) {
  $secure = Read-Host $Prompt -AsSecureString
  $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $value = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    if ($null -eq $value) { return "" }
    return $value.Trim()
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
  }
}

Write-Host "Starting VMS Backend (dev profile)..." -ForegroundColor Cyan

# --- Profile ---
$env:SPRING_PROFILES_ACTIVE = "dev"

# --- Database ---
$env:DB_URL = "jdbc:postgresql://${DbHost}:${DbPort}/${DbName}?stringtype=unspecified"
$env:DB_USERNAME = $DbUser
$env:DB_PASSWORD = Read-PlainTextSecret "Enter PostgreSQL password for user '$DbUser'"

# --- CORS ---
$env:CORS_ALLOWED_ORIGIN_PATTERNS = "$FrontendOrigin"

# --- JWT ---
# In dev, the app can auto-generate a temporary secret, but we set a stable one here.
$env:JWT_SECRET = -join ((48..57 + 65..90 + 97..122) | Get-Random -Count 64 | ForEach-Object {[char]$_})

# --- SMTP (Brevo) ---
$useEmail = Read-Host "Configure SMTP now? (Y/N)"
if ($useEmail -match '^(Y|y)') {
  $env:MAIL_HOST = "smtp-relay.brevo.com"
  $env:MAIL_PORT = "587"
  do {
    $env:MAIL_USERNAME = (Read-Host "Enter Brevo SMTP Login (username, looks like a12345@smtp-brevo.com)").Trim()
    if ([string]::IsNullOrWhiteSpace($env:MAIL_USERNAME)) {
      Write-Host "ERROR: SMTP Login cannot be empty. Paste the SMTP Login from Brevo (it looks like ...@smtp-brevo.com)." -ForegroundColor Red
    }
  } while ([string]::IsNullOrWhiteSpace($env:MAIL_USERNAME))

  # IMPORTANT:
  # MAIL_FROM is the visible From address (must be a VERIFIED sender/domain in Brevo).
  # It is usually NOT the smtp-brevo.com login.
  $enteredFrom = (Read-Host "Enter MAIL_FROM (verified sender email, e.g. you@yourdomain.com)").Trim()
  if (-not [string]::IsNullOrWhiteSpace($enteredFrom)) {
    $env:MAIL_FROM = $enteredFrom
  } else {
    Write-Host "WARNING: MAIL_FROM not set. Emails may be rejected unless your SMTP login is also a verified sender." -ForegroundColor Yellow
  }
  $env:MAIL_PASSWORD = Read-PlainTextSecret "Enter Brevo SMTP key (password)"
  # SMTP keys should not contain whitespace; strip it to avoid copy/paste issues.
  if ($env:MAIL_PASSWORD) {
    $env:MAIL_PASSWORD = ($env:MAIL_PASSWORD -replace "\s", "")
  }
  $env:MAIL_SMTP_AUTH = "true"
  $env:MAIL_SMTP_STARTTLS_ENABLE = "true"

  Write-Host "SMTP configured:" -ForegroundColor Cyan
  Write-Host "  MAIL_HOST=$($env:MAIL_HOST)" -ForegroundColor Cyan
  Write-Host "  MAIL_PORT=$($env:MAIL_PORT)" -ForegroundColor Cyan
  Write-Host "  MAIL_USERNAME=$($env:MAIL_USERNAME)" -ForegroundColor Cyan
  Write-Host "  MAIL_USERNAME_LENGTH=$($env:MAIL_USERNAME.Length)" -ForegroundColor Cyan
  Write-Host "  MAIL_FROM=$($env:MAIL_FROM)" -ForegroundColor Cyan
  if ($env:MAIL_FROM) { Write-Host "  MAIL_FROM_LENGTH=$($env:MAIL_FROM.Length)" -ForegroundColor Cyan }
  Write-Host "  MAIL_PASSWORD=(hidden)" -ForegroundColor Cyan
  if ($env:MAIL_PASSWORD) { Write-Host "  MAIL_PASSWORD_LENGTH=$($env:MAIL_PASSWORD.Length)" -ForegroundColor Cyan }

  $confirm = Read-Host "Proceed to start backend with these SMTP settings? (Y/N)"
  if ($confirm -notmatch '^(Y|y)') {
    throw "Aborted by user"
  }
}

Push-Location (Split-Path $PSScriptRoot -Parent)
try {
  if ($TestEmailTo) {
    Write-Host "After backend starts, open in browser:" -ForegroundColor Yellow
    Write-Host "  http://localhost:8080/api/test/email?to=$TestEmailTo" -ForegroundColor Yellow
  }
  Write-Host "Running: .\\mvnw.cmd spring-boot:run" -ForegroundColor Green
  .\mvnw.cmd spring-boot:run
} finally {
  Pop-Location
}
