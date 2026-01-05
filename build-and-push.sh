#!/bin/bash

# Sentinel Docker Hub Build and Push Script
# Usage: ./build-and-push.sh <docker-hub-username> [version-tag]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Docker Hub username is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Docker Hub username not provided${NC}"
    echo "Usage: ./build-and-push.sh <docker-hub-username> [version-tag]"
    exit 1
fi

DOCKER_USERNAME=$1
VERSION=${2:-latest}

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Building Helm Analytics Docker Images${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Docker Hub Username: $DOCKER_USERNAME"
echo "Version Tag: $VERSION"
echo ""

# Login to Docker Hub
echo -e "${GREEN}Logging in to Docker Hub...${NC}"
docker login

# Build and push backend
echo -e "${GREEN}Building backend image...${NC}"
docker build -t ${DOCKER_USERNAME}/helm-analytics-backend:${VERSION} ./backend
docker tag ${DOCKER_USERNAME}/helm-analytics-backend:${VERSION} ${DOCKER_USERNAME}/helm-analytics-backend:latest

echo -e "${GREEN}Pushing backend image...${NC}"
docker push ${DOCKER_USERNAME}/helm-analytics-backend:${VERSION}
docker push ${DOCKER_USERNAME}/helm-analytics-backend:latest

# Build and push frontend
echo -e "${GREEN}Building frontend image...${NC}"
docker build -t ${DOCKER_USERNAME}/helm-analytics-frontend:${VERSION} ./frontend
docker tag ${DOCKER_USERNAME}/helm-analytics-frontend:${VERSION} ${DOCKER_USERNAME}/helm-analytics-frontend:latest

echo -e "${GREEN}Pushing frontend image...${NC}"
docker push ${DOCKER_USERNAME}/helm-analytics-frontend:${VERSION}
docker push ${DOCKER_USERNAME}/helm-analytics-frontend:latest

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Build and Push Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Images pushed:"
echo "  - ${DOCKER_USERNAME}/helm-analytics-backend:${VERSION}"
echo "  - ${DOCKER_USERNAME}/helm-analytics-backend:latest"
echo "  - ${DOCKER_USERNAME}/helm-analytics-frontend:${VERSION}"
echo "  - ${DOCKER_USERNAME}/helm-analytics-frontend:latest"
echo ""
echo "To pull these images:"
echo "  docker pull ${DOCKER_USERNAME}/helm-analytics-backend:${VERSION}"
echo "  docker pull ${DOCKER_USERNAME}/helm-analytics-frontend:${VERSION}"
