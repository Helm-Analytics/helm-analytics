# 🚀 Helm Analytics - Community Installation Guide

Get your own privacy-first analytics platform running in under 5 minutes!

## Prerequisites

- Docker & Docker Compose installed
- 4GB RAM minimum (8GB recommended)
- 10GB free disk space

## Quick Start

### 1. Download the docker-compose file

```bash
# Option 1: Clone the repository
git clone https://github.com/yourusername/sentinel-mvp.git
cd sentinel-mvp

# Option 2: Download just the docker-compose file
curl -O https://raw.githubusercontent.com/yourusername/sentinel-mvp/master/docker-compose.community.yml
curl -O https://raw.githubusercontent.com/yourusername/sentinel-mvp/master/.env.example
```

### 2. Configure your environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your favorite editor
nano .env  # or use: code .env, vim .env, etc.
```

**Important:** Change these values in `.env`:
- `POSTGRES_PASSWORD` - Database password
- `CLICKHOUSE_PASSWORD` - ClickHouse password  
- `JWT_SECRET` - Secret key for authentication
- `GEMINI_API_KEY` - (Optional) For AI-powered insights

### 3. Start Helm Analytics

```bash
# Start all services in detached mode
docker-compose -f docker-compose.community.yml up -d

# View logs (optional)
docker-compose -f docker-compose.community.yml logs -f
```

### 4. Access Your Analytics Dashboard

Open your browser and navigate to:
- **Frontend Dashboard:** http://localhost:8012
- **Backend API:** http://localhost:6060
- **API Documentation:** http://localhost:6060/swagger/index.html

### 5. Create Your First Account

1. Go to http://localhost:8012/register
2. Create an admin account
3. Add your first website
4. Copy the tracking code
5. Paste it in your website's `<head>` tag

That's it! 🎉

## Management Commands

```bash
# Stop all services
docker-compose -f docker-compose.community.yml down

# Stop and remove all data (careful!)
docker-compose -f docker-compose.community.yml down -v

# View logs for a specific service
docker-compose -f docker-compose.community.yml logs backend
docker-compose -f docker-compose.community.yml logs frontend

# Restart a service
docker-compose -f docker-compose.community.yml restart backend

# Pull latest images
docker-compose -f docker-compose.community.yml pull

# Update to latest version
docker-compose -f docker-compose.community.yml pull
docker-compose -f docker-compose.community.yml up -d
```

## Data Persistence

Your data is stored in Docker volumes:
- `helm-postgres-data` - User accounts, sites, configurations
- `helm-clickhouse-data` - Analytics events, sessions, replays

To backup your data:
```bash
# Backup Postgres
docker exec helm-postgres pg_dump -U sentinel sentinel > backup.sql

# Backup ClickHouse
docker exec helm-clickhouse clickhouse-client --query="SELECT * FROM sentinel.events FORMAT Native" > events_backup.native
```

## Troubleshooting

### Services won't start
```bash
# Check Docker is running
docker ps

# Check logs for errors
docker-compose -f docker-compose.community.yml logs

# Ensure ports are not in use
netstat -ano | findstr :8012
netstat -ano | findstr :6060
```

### Can't connect to database
```bash
# Verify database is healthy
docker-compose -f docker-compose.community.yml exec db pg_isready -U sentinel

# Check environment variables
docker-compose -f docker-compose.community.yml config
```

### Frontend shows connection error
- Make sure the backend is running: `docker ps | grep helm-backend`
- Check backend logs: `docker-compose -f docker-compose.community.yml logs backend`
- Verify backend is healthy: `curl http://localhost:6060/health`

## Production Deployment

For production use:

1. **Use a reverse proxy** (nginx, Caddy, Traefik)
2. **Enable HTTPS** with Let's Encrypt
3. **Change default passwords** in `.env`
4. **Set proper resource limits** in docker-compose
5. **Configure backups** for your data volumes
6. **Use a firewall** to restrict access

Example nginx config:
```nginx
server {
    listen 80;
    server_name analytics.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:8012;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api {
        proxy_pass http://localhost:6060;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Support

- 📖 Documentation: https://github.com/yourusername/sentinel-mvp/wiki
- 💬 Community: https://github.com/yourusername/sentinel-mvp/discussions
- 🐛 Issues: https://github.com/yourusername/sentinel-mvp/issues
- ⭐ Star us on GitHub!

## License

Open source under the MIT License. See LICENSE file for details.
