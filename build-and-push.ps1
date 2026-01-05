# Sentinel Docker Hub Build and Push Script (PowerShell)
# Usage: .\build-and-push.ps1 -Username <docker-hub-username> [-Version <version-tag>]

param(
    [Parameter(Mandatory=$true)]
    [string]$Username,
    
    [Parameter(Mandatory=$false)]
    [string]$Version = "latest"
)

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "========================================" "Blue"
Write-ColorOutput "Building Sentinel Docker Images" "Blue"
Write-ColorOutput "========================================" "Blue"
Write-Host ""
Write-ColorOutput "Docker Hub Username: $Username" "Cyan"
Write-ColorOutput "Version Tag: $Version" "Cyan"
Write-Host ""

# Login to Docker Hub
Write-ColorOutput "Logging in to Docker Hub..." "Green"
docker login

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "Error: Docker login failed" "Red"
    exit 1
}

# Build and push backend
Write-ColorOutput "Building backend image..." "Green"
docker build -t ${Username}/sentinel-backend:${Version} ./backend

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "Error: Backend build failed" "Red"
    exit 1
}

docker tag ${Username}/sentinel-backend:${Version} ${Username}/sentinel-backend:latest

Write-ColorOutput "Pushing backend image..." "Green"
docker push ${Username}/sentinel-backend:${Version}
docker push ${Username}/sentinel-backend:latest

# Build and push frontend
Write-ColorOutput "Building frontend image..." "Green"
docker build -t ${Username}/sentinel-frontend:${Version} ./frontend

if ($LASTEXITCODE -ne 0) {
    Write-ColorOutput "Error: Frontend build failed" "Red"
    exit 1
}

docker tag ${Username}/sentinel-frontend:${Version} ${Username}/sentinel-frontend:latest

Write-ColorOutput "Pushing frontend image..." "Green"
docker push ${Username}/sentinel-frontend:${Version}
docker push ${Username}/sentinel-frontend:latest

Write-Host ""
Write-ColorOutput "========================================" "Green"
Write-ColorOutput "✅ Build and Push Complete!" "Green"
Write-ColorOutput "========================================" "Green"
Write-Host ""
Write-ColorOutput "Images pushed:" "Cyan"
Write-Host "  - ${Username}/sentinel-backend:${Version}"
Write-Host "  - ${Username}/sentinel-backend:latest"
Write-Host "  - ${Username}/sentinel-frontend:${Version}"
Write-Host "  - ${Username}/sentinel-frontend:latest"
Write-Host ""
Write-ColorOutput "To pull these images:" "Cyan"
Write-Host "  docker pull ${Username}/sentinel-backend:${Version}"
Write-Host "  docker pull ${Username}/sentinel-frontend:${Version}"
