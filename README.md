# Helm Analytics

**Privacy-first, self-hosted web analytics platform.**

Helm Analytics provides real-time traffic insights, session replay, and conversion tracking while maintaining complete data ownership and compliance. Designed as a high-performance alternative to SaaS analytics, it runs entirely on your infrastructure.

![Dashboard Preview](assets/dashboard.png)

## Overview

Helm Analytics is built for performance and privacy. It uses a lightweight JavaScript tracker (< 2KB) to collect essential metrics without cookies or invasive fingerprinting. The backend leverages ClickHouse for rapid query execution on large datasets.

**Key Capabilities:**
- **Real-Time Dashboard:** Monitor visitors, page views, and traffic sources instantly.
- **Session Replay:** Visual playback of user interactions to identify UX issues.
- **Conversion Funnels:** Track user journeys through multi-step flows.
- **Heatmaps:** Click and scroll analysis for page optimization.
- **Privacy Compliance:** GDPR/CCPA compliant by design. No PII storage.

## Architecture

The platform consists of three core components:

1.  **Ingestion API (Go):** High-throughput event collector. Handles validation, rate limiting, and writes to ClickHouse.
2.  **Analytics Engine (ClickHouse):** Columnar database optimized for aggregation queries.
3.  **Dashboard (React/Vite):** Single-page application for data visualization and management.

## Quick Start

The recommended way to deploy Helm Analytics is via Docker Compose.

### Prerequisites
- Docker & Docker Compose
- 2GB RAM (Recommended minimum)

### Deployment

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/helm-analytics/helm-analytics.git
    cd helm-analytics
    ```

2.  **Start services:**
    ```bash
    docker-compose up -d
    ```

3.  **Access the dashboard:**
    Open `http://localhost:8012` in your browser.
    
    **Default Credentials:**
    - Email: `admin@helm-analytics.com`
    - Password: `admin123`

> **Security Note:** Change the default password immediately after initial login.

## Integration

Add the tracking script to your website's `<head>` section. Replace `SITE_ID` with the ID generated in your dashboard.

```html
<script 
  defer 
  data-site-id="SITE_ID" 
  data-api="https://your-instance.com" 
  src="https://your-instance.com/static/tracker-v5.js">
</script>
```

### Custom Events

Track specific user actions using the `helm` global object:

```javascript
// Track button click
helm.trackEvent('signup_click', { plan: 'pro' });
```

## Documentation

Comprehensive documentation is available at [docs.helm-analytics.com](https://docs.helm-analytics.com).

- [Installation Guide](https://docs.helm-analytics.com/guide/installation)
- [API Reference](https://docs.helm-analytics.com/api/tracking)
- [Self-Hosting](https://docs.helm-analytics.com/self-hosting/docker)

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
