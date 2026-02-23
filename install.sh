#!/bin/bash
# Helm Analytics - 1-Click Installation Script
# Usage: curl -sSL https://raw.githubusercontent.com/Helm-Analytics/sentinel-mvp/main/install.sh | bash

set -e

# Styling
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "======================================================="
echo "    🚀 Installing Helm Analytics (Community Edition)   "
echo "======================================================="
echo -e "${NC}"

# 1. Check & Install Docker
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Docker not found. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    rm get-docker.sh
else
    echo -e "${GREEN}✅ Docker is already installed.${NC}"
fi

# Check if docker compose works
if ! docker compose version &> /dev/null; then
    echo -e "${YELLOW}🐳 Docker Compose v2 not found. Please install Docker Compose plugin.${NC}"
    exit 1
fi

# 2. Setup Directory
INSTALL_DIR="/opt/helm-analytics"
echo -e "\n${BLUE}📂 Setting up installation directory at ${INSTALL_DIR}...${NC}"
sudo mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

# 3. Download Source Code
echo -e "\n${BLUE}⬇️ Cloning Helm Analytics repository...${NC}"
sudo git clone https://github.com/Helm-Analytics/sentinel-mvp.git .

# 4. Pull and Start the Application
echo -e "\n${BLUE}⚡ Building images and starting Helm Analytics...${NC}"
sudo docker compose up -d --build

# 5. Done
echo -e "\n${GREEN}=======================================================${NC}"
echo -e "${GREEN}🎉 Helm Analytics has been successfully installed!${NC}"
echo -e "${GREEN}=======================================================${NC}"
echo -e "👉 Access your dashboard at: ${BLUE}http://$(curl -s ifconfig.me):8012${NC} (or your server's IP)"
echo -e "👉 Default Login: Register a new account on the dashboard."
echo -e "To manage your instance, run: cd $INSTALL_DIR && sudo docker compose <up|down|logs>"
