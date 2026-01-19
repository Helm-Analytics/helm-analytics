# Helm Analytics 🛡️

<div align="center">

![Helm Analytics Logo](https://raw.githubusercontent.com/yourusername/helm-analytics/main/assets/logo.png)

**Privacy-first, open-source web analytics for the modern web**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Docker Pulls](https://img.shields.io/docker/pulls/danielowenllm/helm-analytics-backend.svg)](https://hub.docker.com/r/danielowenllm/helm-analytics-backend)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/helm-analytics?style=social)](https://github.com/yourusername/helm-analytics)

[Live Demo](https://app.helm-analytics.com/demo) · [Documentation](https://docs.helm-analytics.com) · [Cloud Version](https://helm-analytics.com)

</div>

---

## 🎯 Why Helm Analytics?

**Stop sending your user data to big tech.** Helm Analytics gives you powerful insights while respecting privacy and maintaining complete data ownership.

- ✅ **100% Open Source** - Self-host on your infrastructure
- ✅ **Privacy-First** - No cookies, GDPR/CCPA compliant
- ✅ **Lightweight** - <5KB tracker, won't slow your site
- ✅ **Real-Time** - Live visitor tracking and instant insights
- ✅ **Powerful** - Session replays, heatmaps, funnels, and more

---

## ✨ Features

### Core Analytics
- 📊 **Real-time Dashboard** - Live visitor count, page views, referrers
- 📈 **Custom Events** - Track button clicks, form submissions, any user action
- 🎯 **Conversion Funnels** - Visualize user journeys and identify drop-offs
- 🌍 **Geographic Insights** - Country, city, and timezone data
- 📱 **Device Analytics** - Browser, OS, and screen size breakdown

### Advanced Features (Self-Hosted)
- 🎬 **Session Replays** - Watch how users interact with your site
- 🔥 **Click Heatmaps** - Visualize where users click and scroll
- 🛡️ **Bot Detection & Firewall** - Block malicious traffic automatically
- ⚡ **Web Vitals Monitoring** - Track Core Web Vitals (LCP, FID, CLS)
- 🔍 **Activity Log** - Complete audit trail of all events

---

## 🚀 Quick Start

### Option 1: Docker Compose (Recommended)

The easiest way to get started:

```bash
# Clone the repository
git clone https://github.com/yourusername/helm-analytics.git
cd helm-analytics

# Start all services
docker-compose up -d
```

That's it! Access your dashboard at `http://localhost:8012`.

**Default credentials:**
- Email: `admin@helm-analytics.com`
- Password: `admin123` (change immediately!)

### Option 2: Manual Setup

<details>
<summary>Click to expand manual installation steps</summary>

**Prerequisites:**
- Go 1.21+
- Node.js 18+
- PostgreSQL 14+
- ClickHouse 23+

**Backend:**
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials
go run main.go
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

</details>

---

## 📝 Adding Tracking to Your Site

Add this snippet to your website's `<head>`:

```html
<script 
  defer 
  data-site-id="YOUR_SITE_ID" 
  data-api="http://localhost:6060" 
  src="http://localhost:6060/static/tracker-v5.js">
</script>
```

**Getting your Site ID:**
1. Log into your Helm dashboard
2. Go to Settings → Websites
3. Click "Add Website"
4. Copy your unique Site ID

---

## 🎯 Track Custom Events

```javascript
// Track button clicks
helm.trackEvent('button_clicked', {
  button_name: 'Get Started',
  location: 'hero'
});

// Track form submissions
helm.trackEvent('form_submitted', {
  form_name: 'contact',
  success: true
});

// E-commerce tracking
helm.trackEvent('purchase', {
  amount: 99.99,
  product_id: '12345',
  category: 'subscription'
});
```

---

## 🛠️ Server-Side SDKs

Protect your application with Shield Middleware - automatic bot detection and blocking.

### Node.js (Express)

```bash
npm install @helm-analytics/node
```

```javascript
const { shieldMiddleware } = require('@helm-analytics/node');

app.use(shieldMiddleware({
  apiUrl: 'http://localhost:6060',
  siteId: 'your-site-id'
}));
```

### Python (Flask/FastAPI)

```bash
pip install helm-analytics
```

```python
from helm_analytics import ShieldMiddleware

app.wsgi_app = ShieldMiddleware(app.wsgi_app, 
    api_url='http://localhost:6060',
    site_id='your-site-id'
)
```

**[View full SDK documentation →](./sdk/)**

---

## 📊 Tech Stack

- **Backend:** Go, PostgreSQL, ClickHouse
- **Frontend:** React, Vite, Tailwind CSS
- **Analytics Engine:** ClickHouse (columnar database)
- **Session Replays:** rrweb
- **Deployment:** Docker, Docker Compose

---

## 🎨 Screenshots

<details>
<summary>Click to view screenshots</summary>

### Dashboard
![Dashboard](./assets/dashboard.png)

### Session Replays
![Session Replays](./assets/session-replay.png)

### Heatmaps
![Heatmaps](./assets/heatmap.png)

</details>

---

## 🔧 Configuration

Key environment variables in `.env`:

```bash
# Database
DATABASE_URL=postgres://user:pass@localhost:5432/helm
CLICKHOUSE_URL=tcp://localhost:9000

# API Server
PORT=6060
ADMIN_SECRET=your-secret-key

# Optional: AI Features
GEMINI_API_KEY=your-gemini-key
```

**[View complete configuration guide →](./docs/configuration.md)**

---

## 🚢 Deployment

### Production with Docker

```bash
# Pull latest images
docker pull danielowenllm/helm-analytics-backend:latest
docker pull danielowenllm/helm-analytics-frontend:latest

# Run with production config
docker-compose -f docker-compose.yml up -d
```

### Cloud Providers

- **DigitalOcean:** [One-click deploy](./docs/deploy/digitalocean.md)
- **AWS:** [EC2 setup guide](./docs/deploy/aws.md)
- **Self-Hosted:** [VPS setup guide](./docs/deploy/vps.md)

---

## 🌐 Helm Cloud

Don't want to self-host? Use our managed cloud version:

- ✅ Zero setup - start tracking in 30 seconds
- ✅ Automatic updates and scaling
- ✅ 99.9% uptime SLA
- ✅ Priority support

**[Start free trial →](https://helm-analytics.com)**

---

## 🤝 Contributing

We love contributions! Here's how to get started:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**[Read our Contributing Guide →](CONTRIBUTING.md)**

---

## 📄 License

Helm Analytics is open-source software licensed under the **MIT License**.

This means you can:
- ✅ Use it commercially
- ✅ Modify it freely
- ✅ Distribute it
- ✅ Use it privately

**[View full license →](LICENSE)**

---

## 💬 Community & Support

- **Discord:** [Join our community](https://discord.gg/helm-analytics)
- **GitHub Issues:** [Report bugs](https://github.com/yourusername/helm-analytics/issues)
- **Email:** hello@helm-analytics.com
- **Docs:** [docs.helm-analytics.com](https://docs.helm-analytics.com)

---

## ⭐ Star History

If you find Helm Analytics useful, please consider giving us a star! It helps the project grow.

[![Star History Chart](https://api.star-history.com/svg?repos=yourusername/helm-analytics&type=Date)](https://star-history.com/#yourusername/helm-analytics&Date)

---

<div align="center">

**Built with ❤️ by developers, for developers**

[Website](https://helm-analytics.com) · [Documentation](https://docs.helm-analytics.com) · [Twitter](https://twitter.com/helmanalytics)

</div>
