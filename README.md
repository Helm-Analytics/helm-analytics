# Helm Analytics 🛡️

![Helm Analytics Banner](https://raw.githubusercontent.com/Helm-Analytics/.github/main/assets/banner.png)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker Hub](https://img.shields.io/docker/pulls/danielowenllm/helm-analytics-backend.svg)](https://hub.docker.com/r/danielowenllm/helm-analytics-backend)
[![Uptime](https://img.shields.io/badge/Uptime-99.9%25-brightgreen)](https://helm-analytics.com)

**Helm** is a privacy-first, open-source web analytics platform designed for the modern web. It provides high-fidelity insights without compromising user privacy or application performance.

## ✨ Features

- **🛡️ Privacy-First**: No cookies, no IP logging, GDPR/CCPA compliant by design.
- **⚡ Lightweight**: < 5KB tracker script that won't slow down your site.
- **📊 Real-time Dashboard**: Live visitor count, beautiful graphs, and instant insights.
- **🔍 Session Replay**: Watch how users interact with your app (powered by rrweb).
- **🕸️ Heatmaps**: Visualize where users click and scroll.
- **🛑 Shield Middleware**: Block malicious bots and IPs at the edge (Node.js & Python SDKs).
- **🛒 Funnel Analysis**: Track conversion rates and identify drop-off points.
- **🚀 Self-Hostable**: Run it on your own infrastructure with Docker.

## 🚀 Quick Start

### 1. Run with Docker Compose

The fastest way to get started is using Docker Compose.

```bash
# Clone the repository
git clone https://github.com/Helm-Analytics/sentinel-mvp.git helm-analytics
cd helm-analytics

# Start the services
docker-compose -f docker-compose.community.yml up -d
```

Access the dashboard at `http://localhost:8012`.

### 2. Add the Tracking Script

Add the following snippet to the `<head>` of your website:

```html
<script 
  defer 
  data-site-id="YOUR_SITE_ID" 
  data-api="http://localhost:6060" 
  src="http://localhost:6060/static/tracker.js">
</script>
```

## 📦 Deployment

### Production Setup

For production, updating the `docker-compose.community.yml` environment variables is recommended:

```yaml
version: '3.8'
services:
  backend:
    image: danielowenllm/helm-analytics-backend:latest
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/helm
      - CLICKHOUSE_URL=tcp://clickhouse:9000
      
  frontend:
    image: danielowenllm/helm-analytics-frontend:latest
    ports:
      - "80:80"
```

## 🛠️ SDKs & Integrations

Helm offers powerful server-side SDKs for advanced tracking and security.

- **[Node.js SDK](./sdk/node)**: Express/Connect middleware.
- **[Python SDK](./sdk/python)**: Flask/FastAPI middleware.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

Helm Analytics is open-source software licensed under the [MIT license](LICENSE).
