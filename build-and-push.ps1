# Docker Hub Build & Push Script
# Builds and pushes Helm Analytics images to Docker Hub

Write-Host "Building Helm Analytics Docker Images..." -ForegroundColor Cyan

# Configuration
$DOCKER_USERNAME = "danielowenllm"
$REPO_NAME = "helm-analytics"
$VERSION = "1.0.0"

Write-Host ""
Write-Host "Step 1: Building Backend Image..." -ForegroundColor Yellow
docker build -t ${DOCKER_USERNAME}/${REPO_NAME}:backend-${VERSION} -t ${DOCKER_USERNAME}/${REPO_NAME}:backend-latest -f backend/Dockerfile backend/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Backend image built successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Building Frontend Image..." -ForegroundColor Yellow
docker build -t ${DOCKER_USERNAME}/${REPO_NAME}:frontend-${VERSION} -t ${DOCKER_USERNAME}/${REPO_NAME}:frontend-latest -f frontend/Dockerfile frontend/

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend image built successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Pushing Backend to Docker Hub..." -ForegroundColor Yellow
docker push ${DOCKER_USERNAME}/${REPO_NAME}:backend-${VERSION}
docker push ${DOCKER_USERNAME}/${REPO_NAME}:backend-latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "Backend push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Backend pushed successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Pushing Frontend to Docker Hub..." -ForegroundColor Yellow
docker push ${DOCKER_USERNAME}/${REPO_NAME}:frontend-${VERSION}
docker push ${DOCKER_USERNAME}/${REPO_NAME}:frontend-latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend push failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend pushed successfully!" -ForegroundColor Green

Write-Host ""
Write-Host "All images pushed to Docker Hub!" -ForegroundColor Green
Write-Host ""
Write-Host "Images available at:" -ForegroundColor Cyan
Write-Host "  Backend:  docker pull ${DOCKER_USERNAME}/${REPO_NAME}:backend-latest"
Write-Host "  Frontend: docker pull ${DOCKER_USERNAME}/${REPO_NAME}:frontend-latest"
Write-Host ""
Write-Host "View on Docker Hub:" -ForegroundColor Cyan
Write-Host "  https://hub.docker.com/r/${DOCKER_USERNAME}/${REPO_NAME}/tags"
Write-Host ""
