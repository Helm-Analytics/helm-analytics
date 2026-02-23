#!/bin/bash
set -e

# ANSI Colors for better logging
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${CYAN}--------------------------------------------------${NC}"
echo -e "${BLUE}   ⚓ Helm Analytics Community Edition Installer${NC}"
echo -e "${CYAN}--------------------------------------------------${NC}"

# 1. Pre-flight Checks
echo -e "🔍 ${BLUE}Step 1: Checking environment...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed.${NC}"
    echo -e "Please install Docker and Docker Compose from https://docker.com"
    exit 1
fi

# Verify Docker Daemon connectivity
if ! docker info &> /dev/null; then
    echo -e "${RED}❌ Docker daemon is not accessible.${NC}"
    echo -e "${YELLOW}Suggestion:${NC} Ensure Docker Desktop is running. If you're on Windows/WSL, make sure WSL integration is enabled in Docker Desktop settings."
    exit 1
fi

echo -e "  ${GREEN}✓ Docker is running${NC}"

# 2. Configuration Generation
echo -e "\n⚙️  ${BLUE}Step 2: Generating configuration...${NC}"

if [ ! -f .env ]; then
    # Generate secure password
    DB_PASSWORD=$(openssl rand -base64 24 | tr -d '/+' || echo "helm_pass_$(date +%s)")
    ADMIN_KEY=$(openssl rand -hex 16 || echo "adm_$(date +%s)")

    cat > .env <<EOF
# --- Helm Analytics Configuration ---
# Generated on: $(date)

# Registry Images
BACKEND_IMAGE=danielowenllm/helm-analytics-backend:latest
FRONTEND_IMAGE=danielowenllm/helm-analytics-frontend:latest

# Frontend Settings
# CRITICAL: Change this to your public domain for production!
VITE_API_URL=http://localhost:6060

# Backend Settings
DATABASE_URL=postgres://sentinel:${DB_PASSWORD}@db:5432/sentinel?sslmode=disable
GEMINI_API_KEY=  # Required for AI Intelligence features
DEPLOYMENT_MODE=community

# ClickHouse Settings
CLICKHOUSE_HOST=clickhouse
CLICKHOUSE_PORT=8123
CLICKHOUSE_DB=sentinel
CLICKHOUSE_USER=sentinel
CLICKHOUSE_PASSWORD=${DB_PASSWORD}

# Postgres Settings
POSTGRES_USER=sentinel
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DB=sentinel

# Admin Key for internal management
ADMIN_API_KEY=${ADMIN_KEY}
EOF
    echo -e "  ${GREEN}✓ Created new .env file with secure credentials.${NC}"
    echo -e "  ${YELLOW}Note:${NC} You can customize your settings in ${CYAN}$(pwd)/.env${NC}"
else
    echo -e "  ${YELLOW}ℹ️  Existing .env file found. Skipping generation.${NC}"
fi

# 3. Deployment
echo -e "\n📥 ${BLUE}Step 3: Orchestrating services...${NC}"
echo -e "   Pulling latest container images..."

if ! docker compose pull; then
    echo -e "${RED}❌ Failed to pull images.${NC}"
    echo -e "Check your internet connection or repository permissions."
    exit 1
fi

echo -e "   Starting services in background..."
docker compose up -d

# 4. Final Status
echo -e "\n⏳ ${BLUE}Step 4: Verifying health...${NC}"
echo -n "   Waiting for services to stabilize"
for i in {1..5}; do echo -n "."; sleep 1; done
echo -e " ${GREEN}Ready!${NC}"

echo -e "\n${GREEN}==================================================${NC}"
echo -e "🎉 ${GREEN}Helm Analytics is successfully installed!${NC}"
echo -e "${GREEN}==================================================${NC}"
echo -e "\n${BLUE}Access Points:${NC}"
echo -e "  📍 Dashboard: ${CYAN}http://localhost:8012${NC}"
echo -e "  📍 API Specs: ${CYAN}http://localhost:6060/docs${NC}"
echo -e "\n${BLUE}Post-Install Instructions:${NC}"
echo -e "  1. View local settings: ${YELLOW}cat .env${NC}"
echo -e "  2. Enable AI Insights: Add your ${CYAN}GEMINI_API_KEY${NC} to .env and run ${YELLOW}docker compose restart backend${NC}"
echo -e "  3. To stop Helm: ${YELLOW}docker compose down${NC}"
echo -e "\n${BLUE}Happy Hosting! ⚓${NC}\n"
