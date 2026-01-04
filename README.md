# Helm Analytics

[![License](https://img.shields.io/badge/license-AGPLv3-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)]()
[![Deployment](https://img.shields.io/badge/deploy-dokploy-purple.svg)]()

**The First Website Intelligence Platform with AI and Security Built-In**

Privacy-first analytics + AI insights + bot protection, all in one open-source platform.

Self-host for free, or let us host it for you.

[Live Demo](https://demo.helm.io) | [Documentation](https://docs.helm.io) | [Pricing](https://helm.io/pricing)

---

## Why Helm?

- ✅ **Privacy-First** - Cookieless, GDPR-compliant, no personal data collection
- ✅ **AI-Powered** - Get strategic insights, not just numbers
- ✅ **Security Built-In** - Block bots & click fraud, protect your budget
- ✅ **Self-Hostable** - Your data, your servers, forever free (AGPLv3)
- ✅ **Beautiful & Simple** - One dashboard, all the insights you need

## Quick Start (Community Edition)

### Prerequisites
- Docker & Docker Compose installed
- 2GB RAM minimum
- Port 3000 & 6060 available

### Installation (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/helm-analytics/helm.git
cd helm

# 2. Copy environment file
cp .env.example .env

# 3. Generate secure database password
echo "DB_PASSWORD=$(openssl rand -base64 32)" >> .env

# 4. Start services
docker-compose up -d

# 5. Wait for services to be ready (30 seconds)
sleep 30

# 6. Open dashboard
open http://localhost:3000
```

That's it! Create your account and start tracking.

---

## What's Included

### 🆓 Community Edition (Always Free)

| Feature | Description |
|---------|-------------|
| **Analytics Dashboard** | Real-time visitors, pageviews, referrers, countries, devices |
| **Session Replay** | Watch how users navigate your site |
| **Error Tracking** | Catch JavaScript errors before users complain |
| **Heatmaps** | See exactly where users click |
| **Funnels** | Track multi-step conversions |
| **Firewall** | Block traffic by IP, country, or data center |
| **Bot Detection** | TrustScore algorithm identifies suspicious traffic |
| **AI Insights** | 5 AI-powered reports per day (bring your Gemini API key) |
| **Unlimited Sites** | Track as many websites as you want |
| **Unlimited Events** | No caps, no overages |

### 💎 Pro License ($199/year)

Unlock premium features for self-hosted deployment:

- ✅ **AI Consultant** - Page-by-page strategic analysis
- ✅ **Shield Auto-Block** - Automatic bot blocking at server level
- ✅ **White-Label** - Remove Helm branding
- ✅ **Retention Cohorts** - Measure user stickiness
- ✅ **Google Search Console** integration
- ✅ **Email/Slack Reports** - Automated summaries
- ✅ **Priority Support** - 24hr response time

[Get Pro License →](https://helm.io/pricing#pro-license)

### ☁️ Cloud Hosting ($15-89/mo)

Let us host it for you:

| Plan | Events/Month | Price | Best For |
|------|--------------|-------|----------|
| **Starter** | 50k | $15/mo | Solo developers |
| **Growth** | 300k | $49/mo | Growing startups |
| **Business** | 1M | $89/mo | Established businesses |

All cloud plans include automatic updates, 99.9% uptime, and full support.

[Start Free Trial →](https://helm.io/signup)

---

## Deployment Options

### Option 1: Docker Compose (Community)

See [Quick Start](#quick-start-community-edition) above.

### Option 2: Dokploy (Cloud/Production)

```bash
# Deploy to Dokploy
git clone https://github.com/helm-analytics/helm.git
cd helm

# Use cloud configuration
cp docker-compose.cloud.yml docker-compose.yml

# Set environment variables in Dokploy dashboard
# Deploy via Dokploy UI
```

### Option 3: One-Click Deployments

[![Deploy to Railway](https://railway.app/button.svg)](https://railway.app/new/template/helm)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/helm-analytics/helm)

---

## Configuration

### Environment Variables

```bash
# Deployment Mode
DEPLOYMENT_MODE=community  # or "cloud"

# License (leave blank for Community)
LICENSE_KEY=  # Add Pro/Enterprise license key here

# AI Features (optional)
GEMINI_API_KEY=  # Get from https://aistudio.google.com

# Database
DATABASE_URL=postgresql://helm:password@postgres:5432/helm
CLICKHOUSE_URL=clickhouse://clickhouse:9000

# Cloud-specific (if DEPLOYMENT_MODE=cloud)
STRIPE_SECRET_KEY=
PAYSTACK_SECRET_KEY=
```

See [.env.example](.env.example) for full configuration options.

---

## Upgrading from Community to Pro

### Add License Key

```bash
# Stop services
docker-compose down

# Add license key to .env
echo "LICENSE_KEY=helm_pro_xxxxxxxxxxxxx" >> .env

# Restart
docker-compose up -d

# Check logs
docker-compose logs backend | grep "License activated"
```

You should see: `✅ License activated: PRO Edition`

---

## Features

### Analytics
- Real-time dashboard
- Unlimited events & sites
- Custom date ranges
- Top pages,referrers, countries, devices
- UTM campaign tracking
- Custom events (button clicks, form submissions)

### AI Intelligence
- Automatic anomaly detection
- Natural language chat with your data
- AI Consultant (Pro/Cloud) - strategic page analysis
- Error analysis & debugging suggestions

### Security
- Advanced bot detection (TrustScore)
- Firewall rules (IP, country, ASN)
- Shield Mode (Pro/Cloud) - auto-blocking at server level
- Real-time threat alerts

### Behavioral Analytics
- Session replay (watch user journeys)
- Click heatmaps
- Scroll depth tracking
- JavaScript error tracking

### Integrations
- Google Search Console (Pro/Cloud)
- Email/Slack reports (Pro/Cloud)
- Webhooks & REST API
- SDKs: Node.js, Python, Go

---

## Architecture

```
Helm Analytics
├── Backend (Go)
│   ├── License validation
│   ├── Analytics API
│   ├── AI engine (Gemini)
│   └── Firewall rules
├── Frontend (React + Vite)
│   ├── Dashboard
│   └── Admin UI
├── Databases
│   ├── PostgreSQL (users, sites, sessions)
│   └── ClickHouse (events, analytics)
└── Tracker (JavaScript)
    ├── <2KB, cookieless
    └── Session replay capture
```

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

# Frontend
cd frontend
npm install
npm run dev
```

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md).

### Areas We Need Help
- Additional SDKs (PHP, Ruby, Java)
- Documentation improvements
- Bug reports & feature requests
- Translations

---

## Proudly Built by DataKriB 🇿🇦

Helm is developed by [DataKriB](https://datakrib.com), an African tech company building open-source infrastructure for the modern web.

**Our Mission:** Make powerful, privacy-first tools accessible to everyone, everywhere.

---

## License

- **Community Edition:** AGPLv3 (see [LICENSE](LICENSE))
- **Pro/Enterprise:** Commercial license required
- **Cloud:** Proprietary (managed by Helm)

---

## Support

- 📚 **Documentation:** [docs.helm.io](https://docs.helm.io)
- 💬 **Discord:** [discord.gg/helm](https://discord.gg/helm)
- 🐛 **Issues:** [GitHub Issues](https://github.com/helm-analytics/helm/issues)
- 📧 **Email:** support@helm.io

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for upcoming features.

**Next Up:**
- [ ] Scroll depth tracking (v2.1)
- [ ] Activity log (v2.1)
- [ ] Period comparison (v2.2)
- [ ] User journey visualization (v2.3)

---

**Star us on GitHub if you find Helm useful! ⭐**
