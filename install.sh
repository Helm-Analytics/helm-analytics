#!/bin/bash
# Helm Analytics - 1-Click Installation Script
# Usage: curl -sSL https://raw.githubusercontent.com/Helm-Analytics/sentinel-mvp/main/install.sh | bash

set -e

# Styling
GREEN='\033[0;32m'

YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}"
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
echo -e "\n${YELLOW}📂 Setting up installation directory at ${INSTALL_DIR}...${NC}"
sudo mkdir -p $INSTALL_DIR
cd $INSTALL_DIR

# 3. Generate docker-compose.yml for Prebuilt Image
echo -e "\n${YELLOW}⬇️ Downloading and configuring Helm Analytics...${NC}"

sudo bash -c 'cat <<EOF > docker-compose.yml
services:
  postgres:
    image: postgres:14-alpine
    container_name: helm-analytics-postgres
    environment:
      POSTGRES_USER: helm
      POSTGRES_PASSWORD: helmpass
      POSTGRES_DB: helm_analytics
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U helm"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  clickhouse:
    image: clickhouse/clickhouse-server
    container_name: helm-analytics-clickhouse
    environment:
      CLICKHOUSE_DB: helm_events
      CLICKHOUSE_USER: helm
      CLICKHOUSE_PASSWORD: helmpass
    volumes:
      - clickhouse_data:/var/lib/clickhouse
    ulimits:
      nofile:
        soft: 262144
        hard: 262144
    healthcheck:
      test: ["CMD-SHELL", "clickhouse-client --user helm --password helmpass --query \"SELECT 1\""]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  helm:
    image: ghcr.io/helm-analytics/helm-analytics-cloud:latest
    container_name: helm-analytics-core
    environment:
      - DATABASE_URL=postgres://helm:helmpass@postgres:5432/helm_analytics?sslmode=disable
      - CLICKHOUSE_URL=tcp://clickhouse:9000
      - CLICKHOUSE_DB=helm_events
      - CLICKHOUSE_USER=helm
      - CLICKHOUSE_PASSWORD=helmpass
      - PORT=7070
      - DEPLOYMENT_MODE=community
      - ADMIN_SECRET=change-this-secret-key
    ports:
      - "7070:7070"
    depends_on:
      postgres:
        condition: service_healthy
      clickhouse:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
  clickhouse_data:
EOF'

# 4. Optional SSL Setup
echo -e "\n${YELLOW}🔒 Do you want to configure automatic HTTPS with a custom domain? (y/N): ${NC}\c"
read -r SETUP_SSL < /dev/tty

if [[ "$SETUP_SSL" =~ ^[Yy]$ ]]; then
    echo -e "\n${YELLOW}⚠️ Ensure you have already pointed your domain's A Record to this server's IP address!${NC}"
    
    # Ensure lsof is installed for port checking
    if ! command -v lsof &> /dev/null; then
        sudo apt-get update -yqq && sudo apt-get install -y lsof >/dev/null 2>&1 || true
    fi

    echo -e "\n${YELLOW}🔎 Checking for port 80/443 availability...${NC}"
    if sudo lsof -i :80 -i :443 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}⚠️  WARNING: Port 80 or 443 is already in use by another service!${NC}"
        echo -e "The following processes are currently using these ports:"
        sudo lsof -i :80 -i :443 -sTCP:LISTEN | awk 'NR>1 {print "  - " $1 " (PID: " $2 ")"}' | sort -u
        
        echo -e "\n${YELLOW}Caddy (our auto-SSL engine) requires these ports to be completely free to acquire certificates.${NC}"
        echo -e "${YELLOW}➤ Do you want Helm Analytics to automatically STOP these services for you? (y/N): ${NC}\c"
        read -r STOP_SERVICES < /dev/tty
        
        if [[ "$STOP_SERVICES" =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}⚙️ Stopping conflicting services...${NC}"
            sudo systemctl stop nginx apache2 traefik caddy 2>/dev/null || true
            sudo systemctl disable nginx apache2 traefik caddy 2>/dev/null || true
            
            PIDS=$(sudo lsof -i :80 -i :443 -sTCP:LISTEN -t 2>/dev/null) || true
            if [ -n "$PIDS" ]; then
                sudo kill -9 $PIDS 2>/dev/null || true
            fi
            echo -e "${GREEN}✅ Conflicting services stopped and disabled.${NC}"
        else
            echo -e "\n${RED}❌ Installation cannot continue with ports 80/443 occupied. Aborting.${NC}"
            exit 1
        fi
    else
        echo -e "${GREEN}✅ Ports 80 and 443 are free.${NC}"
    fi

    echo -e "\n${YELLOW}➤ Enter your Domain Name (e.g. analytics.company.com): ${NC}\c"
    read -r DOMAIN < /dev/tty
    
    echo -e "${YELLOW}➤ Enter your Email (for Let's Encrypt expiration alerts): ${NC}\c"
    read -r EMAIL < /dev/tty

    echo -e "\n${YELLOW}⚙️ Generating Caddyfile...${NC}"
    cat <<EOF > Caddyfile
$DOMAIN {
    tls $EMAIL
    reverse_proxy frontend:80
}
EOF

    echo -e "${YELLOW}⚙️ Integrating Caddy into Docker Compose...${NC}"
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
echo -e "\n${YELLOW}⚡ Pulling images and starting Helm Analytics...${NC}"
sudo docker compose pull
sudo docker compose up -d

# 6. Done
echo -e "\n${GREEN}=======================================================${NC}"
echo -e "${GREEN}🎉 Helm Analytics has been successfully installed!${NC}"
echo -e "${GREEN}=======================================================${NC}"
echo -e "👉 Access your dashboard at: ${YELLOW}$DASHBOARD_URL${NC}"
echo -e "👉 Default Login: Register a new account on the dashboard."
echo -e "To manage your instance, run: cd $INSTALL_DIR && sudo docker compose <up|down|logs>"
