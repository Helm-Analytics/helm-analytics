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
if [ -d ".git" ]; then
    echo -e "\n${BLUE}⬇️ Updating Helm Analytics repository...${NC}"
    sudo git fetch --all
    sudo git reset --hard origin/master
    sudo git pull
else
    echo -e "\n${BLUE}⬇️ Cloning Helm Analytics repository...${NC}"
    sudo git clone https://github.com/Helm-Analytics/helm-analytics.git .
fi

# 4. Optional SSL Setup
echo -e "\n${BLUE}🔒 Do you want to configure automatic HTTPS with a custom domain? (y/N): ${NC}\c"
read -r SETUP_SSL < /dev/tty

if [[ "$SETUP_SSL" =~ ^[Yy]$ ]]; then
    echo -e "\n${YELLOW}Ensure you have already pointed your domain's A Record to this server's IP address!${NC}"
    echo -e "${BLUE}➤ Enter your Domain Name (e.g. analytics.company.com): ${NC}\c"
    read -r DOMAIN < /dev/tty
    
    echo -e "${BLUE}➤ Enter your Email (for Let's Encrypt expiration alerts): ${NC}\c"
    read -r EMAIL < /dev/tty

    echo -e "\n${BLUE}⚙️ Generating Caddyfile...${NC}"
    cat <<EOF > Caddyfile
$DOMAIN {
    tls $EMAIL
    reverse_proxy frontend:80
}
EOF

    echo -e "${BLUE}⚙️ Integrating Caddy into Docker Compose...${NC}"
    cat <<EOF > docker-compose.override.yml
services:
  caddy:
    image: caddy:alpine
    container_name: helm-caddy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
    depends_on:
      - frontend

volumes:
  caddy_data:
  caddy_config:
EOF
    echo -e "${GREEN}✅ SSL Configuration ready.${NC}"
    DASHBOARD_URL="https://$DOMAIN"
else
    DASHBOARD_URL="http://$(curl -s ifconfig.me):8012"
fi

# 5. Pull and Start the Application
echo -e "\n${BLUE}⚡ Building images and starting Helm Analytics...${NC}"
sudo docker compose up -d --build

# 6. Done
echo -e "\n${GREEN}=======================================================${NC}"
echo -e "${GREEN}🎉 Helm Analytics has been successfully installed!${NC}"
echo -e "${GREEN}=======================================================${NC}"
echo -e "👉 Access your dashboard at: ${BLUE}$DASHBOARD_URL${NC}"
echo -e "👉 Default Login: Register a new account on the dashboard."
echo -e "To manage your instance, run: cd $INSTALL_DIR && sudo docker compose <up|down|logs>"
