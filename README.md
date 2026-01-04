# Helm Analytics

[![License](https://img.shields.io/badge/license-AGPLv3-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)]()

**Privacy-first web analytics with AI insights and built-in security**

Open-source, self-hostable, and cookieless. Get the insights you need without compromising your users' privacy.

[Live Demo](https://sentinel-mvp.getmusterup.com)

---

## Why Helm?

- ✅ **Privacy-First** - Cookieless, GDPR-compliant, no personal data collection
- ✅ **Self-Hostable** - Your data, your servers (AGPLv3)
- ✅ **Real-Time** - See visitors as they browse
- ✅ **Lightweight** - Tracker script is only 12KB

## Features

### Analytics Dashboard
- Real-time visitor tracking
- Pageviews, unique visitors, bounce rate
- Top pages and referrers
- Geographic analytics (countries)
- Device and browser breakdown
- Custom date ranges (24h, 7d, 30d, 90d)

### Behavior Tracking
- Session replay (watch user sessions)
- Error tracking (catch JavaScript errors)
- Custom events (track button clicks, form submissions, etc.)
- Web Vitals monitoring (LCP, FID, CLS)
- Automatic scroll depth tracking
- File download tracking
- Outbound link tracking

### Security Features
- Bot detection with TrustScore algorithm
- Traffic Quality Score (0-100)
- Firewall rules (block by IP, country, or data center)
- Real-time threat monitoring

### AI Insights (Optional)
- Automatic traffic analysis
- Anomaly detection
- Natural language summaries
- Requires Gemini API key (bring your own)

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- 2GB RAM minimum
- Ports 3000 & 6060 available

### Installation

```bash
# Clone repository
git clone https://github.com/Helm-Analytics/sentinel-mvp.git
cd sentinel-mvp

# Copy environment file
cp .env.example .env

# Generate secure secrets
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# Start services
docker-compose up -d

# Open dashboard
http://localhost:8012
```

---

## Tracking Script Integration

Add this script to your website before the closing `</body>` tag:

```html
<script src="https://api-sentinel.getmusterup.com/static/tracker-v5.js" 
  data-site-id="your-site-id"></script>
```

**For self-hosted setups**, the script automatically detects your API URL:

```html
<!-- No configuration needed! -->
<script src="http://localhost:6060/static/tracker-v5.js" 
  data-site-id="your-site-id"></script>
```

### What Gets Tracked Automatically

✅ Pageviews  
✅ Referrers  
✅ Geographic data (via IP)  
✅ Device info (browser, OS, screen size)  
✅ Session tracking  
✅ Web Vitals (LCP, FID, CLS)  
✅ JavaScript errors  
✅ File downloads (any `<a download>` link)  
✅ Outbound links  
✅ Scroll depth (25%, 50%, 75%, 100%)  

---

## Custom Events

Track any user action:

```javascript
// Track button click
helm.trackEvent('button_clicked', {
  location: 'header',
  text: 'Sign Up'
});

// Track purchase
helm.trackEvent('purchase', {
  amount: 99.99,
  currency: 'USD',
  product_id: '12345'
});

// Track form submission
helm.trackEvent('form_submitted', {
  form_name: 'contact'
});
```

---

## Environment Variables

Key configuration options in `.env`:

```bash
# Database
DATABASE_URL=postgresql://helm:password@postgres:5432/helm
CLICKHOUSE_URL=http://clickhouse:9000

# Security
SESSION_SECRET=<random-string>
JWT_SECRET=<random-string>

# AI Features (optional)
GEMINI_API_KEY=<your-gemini-api-key>

# CORS (for frontend)
CORS_ORIGIN=http://localhost:8012
```

See [.env.example](.env.example) for all options.

---

## Deployment

### Docker Compose (Self-Hosted)

Already configured! Just run:

```bash
docker-compose up -d
```

This starts:
- Backend (Go) on port 6060
- Frontend (React) on port 8012
- PostgreSQL (user data, sites)
- ClickHouse (events, analytics)

### Production (Dokploy / Cloud)

Use `docker-compose.cloud.yml` for production deployments. This configuration:
- Uses Docker Hub images (no local building)
- Configured for reverse proxy (Traefik, Nginx)
- Optimized for cloud environments

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Helm Analytics                      │
└─────────────────────────────────────────────────────┘

Frontend (React)  ←→  Backend (Go)  ←→  Databases
    :8012                :6060           (Postgres
                                         ClickHouse)
                            │
                            ↓
                      AI Engine
                      (Gemini)
```

**Tech Stack:**
- **Backend:** Go 1.21+
- **Frontend:** React 18 + Vite
- **Databases:** PostgreSQL (metadata), ClickHouse (events)
- **Tracker:** Vanilla JavaScript (12KB)

---

## Development

### Requirements
- Go 1.21+
- Node.js 18+
- Docker & Docker Compose

### Setup

```bash
# Backend
cd backend
go mod download
go run main.go

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

---

## Contributing

We welcome contributions!

**Ways to contribute:**
- 🐛 Report bugs via [Issues](https://github.com/Helm-Analytics/sentinel-mvp/issues)
- 💡 Suggest features via [Discussions](https://github.com/Helm-Analytics/sentinel-mvp/discussions)
- 📝 Improve documentation
- 💻 Submit Pull Requests

---

## License

**AGPLv3** - See [LICENSE](LICENSE)

This means:
- ✅ Free to use (personal + commercial)
- ✅ Modify the code
- ✅ Self-host
- ⚠️ Must share modifications if you offer it as a service
- ⚠️ Must keep the source code open

---

## Support

- 📚 **Documentation**: Check code comments and examples
- 🐛 **Issues**: [GitHub Issues](https://github.com/Helm-Analytics/sentinel-mvp/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Helm-Analytics/sentinel-mvp/discussions)

---

## Proudly Built in Africa 🌍

Developed by [DataKriB](https://datakrib.com) - Making powerful, privacy-first tools accessible to everyone.

---

**⭐ Star us on GitHub if you find Helm useful!**
