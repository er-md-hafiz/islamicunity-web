$ErrorActionPreference = "Stop"

# Ensure we are in the script's directory
$ScriptPath = $PSScriptRoot
Set-Location $ScriptPath

Write-Host "Current Directory: $ScriptPath"

# Check if gradlew.bat exists
if (-not (Test-Path ".\gradlew.bat")) {
    Write-Warning "gradlew.bat not found! Attempting to generate it with 'gradle wrapper'..."
    try {
        gradle wrapper
    } catch {
        Write-Error "Could not find 'gradle' on PATH. Please install Gradle or open this project in IntelliJ IDEA/Android Studio to generate the wrapper."
        exit 1
    }
}

Write-Host "Starting Islamic Unity Dashboard..."

# Start Backend
Write-Host "Launching Backend Server..."
Start-Process -FilePath ".\gradlew.bat" -ArgumentList "backend:run" -WorkingDirectory $ScriptPath

# Wait a bit for backend to warm up
Write-Host "Waiting for backend to start..."
Start-Sleep -Seconds 10

# Start Frontend
Write-Host "Launching Frontend Development Server..."
Start-Process -FilePath ".\gradlew.bat" -ArgumentList "frontend:jsBrowserDevelopmentRun" -WorkingDirectory $ScriptPath

Write-Host "Both services are starting in separate windows."
Write-Host "Backend API: http://localhost:8080"
Write-Host "Frontend: http://localhost:8080 (Proxied)"
