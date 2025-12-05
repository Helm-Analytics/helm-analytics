# Helm Analytics

**Take the Helm of Your Data**  
Privacy-first, open-source website intelligence. Get actionable insights without selling your users' data.

![GitHub Repo stars](https://img.shields.io/github/stars/Sentinel-Analytics/sentinel-mvp?style=social)
![GitHub issues](https://img.shields.io/github/issues/Sentinel-Analytics/sentinel-mvp)
![GitHub license](https://img.shields.io/github/license/Sentinel-Analytics/sentinel-mvp)

---

## ✨ Features

### 📊 Core Analytics
- **Traffic Metrics**: Page views, unique visitors, bounce rate, average visit time
- **Daily Trends**: Time-series visualization of visitor patterns
- **Top Content**: Most visited pages, referral sources, entry points
- **Geo & Device Insights**: Country breakdown, browser/OS distribution, screen sizes
- **Web Vitals**: LCP, CLS, FID performance monitoring

### 🛡️ Security & Intelligence
- **Traffic Quality Score**: AI-powered bot detection with trust scoring
- **Real-Time Firewall**: Block malicious traffic by IP, country, or ASN (data centers)
- **Shield Mode**: Automatically blocks low-quality traffic

### 🎯 Conversion Tracking
- **Funnels**: Define multi-step conversion flows and track drop-offs
- **Goals**: Set and measure custom objectives

### 🔍 Debugging Tools
- **Session Replay**: rrweb-powered session recordings (privacy-safe)
- **Click Heatmaps**: Visual representation of user interactions
- **Error Tracking**: JavaScript error monitoring with stack traces

### 🚀 Developer Experience
- **Cookieless Tracking**: GDPR/CCPA compliant by default
- **Lightweight Script**: <2KB async tracker that doesn't affect page speed
- **Self-Hosted**: 100% data ownership, no vendor lock-in
- **Docker Ready**: One-command deployment

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- **GeoLite2-Country.mmdb** and **GeoLite2-ASN.mmdb** from [MaxMind](https://dev.maxmind.com/geoip/geolite2-free-geolocation-data)

### 1. Clone & Setup
```bash
git clone https://github.com/Sentinel-Analytics/sentinel-mvp.git
cd sentinel-mvp
# Place GeoLite2 .mmdb files in backend/
```

### 2. Deploy
```bash
docker compose up --build -d
```

### 3. Access
- **Frontend**: `http://localhost:8012`
- **Backend API**: `http://localhost:6060`

### 4. Add Tracking Code
Add this snippet to your website's `<head>`:
```html
<script 
  data-site-id="YOUR_SITE_ID" 
  src="https://your-api-domain.com/static/tracker-v4.js"
  defer>
</script>
```

---

## 🏗️ Tech Stack

- **Frontend**: React, TailwindCSS, Zustand
- **Backend**: Go, Chi Router
- **Database**: PostgreSQL (user data), ClickHouse (analytics events)
- **Tracking**: rrweb (session replay), web-vitals (performance)
- **Deployment**: Docker, Docker Compose

---

## 🤝 Community

- 🐛 **Report Bugs**: [GitHub Issues](https://github.com/Sentinel-Analytics/sentinel-mvp/issues)
- 💡 **Request Features**: [Discussions](https://github.com/Sentinel-Analytics/sentinel-mvp/discussions)
- ⭐ **Support the Project**: Star this repo!

---

## 📜 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Helm Analytics** - Steer your data strategy with confidence.
