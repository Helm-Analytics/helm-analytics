# Helm Analytics Node.js SDK

Official Node.js middleware for [Helm Analytics](https://helm-analytics.com).

## Installation

```bash
npm install helm-analytics
```

## Quick Start (Express)

```javascript
const express = require('express');
const HelmAnalytics = require('helm-analytics');

const app = express();
const helm = new HelmAnalytics({ siteId: 'YOUR_SITE_ID' });

// Use as middleware (with optional Shield filtering)
app.use(helm.middleware({ shield: true })); // Set to true to block requests from bad actors

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);
```

## Manual Tracking

```javascript
app.post('/purchase', (req, res) => {
  // ... process purchase ...
  helm.track(req, 'conversion', { revenue: 50.00 });
  res.json({ success: true });
});
```

## Custom Event Tracking (NEW v5)

Track specific business events with custom properties:

```javascript
app.post('/signup', (req, res) => {
  // ... logic ...
  helm.trackEvent(req, 'signup_success', { plan: 'growth', method: 'google' });
  res.json({ status: 'ok' });
});
```

## Session Stitching

To link server-side events back to the browser session, ensure you pass the `sessionId` (retrieved from `sessionStorage.getItem('helm_session_id')`) in the `X-Helm-Session-Id` header of your frontend API calls.

## Features

- **Non-blocking**: Uses non-blocking fetch calls for event ingestion.
- **Shield Mode**: Active defense against bots and malicious traffic.
- **Auto-UTM Extraction**: Automatically captures marketing campaign data from query strings.
- **Web Vitals**: Track LCP, CLS, and FID performance metrics from the server.
- **Custom Events**: Track business milestones beyond pageviews.
- **Session Stitching**: Maintain user journey continuity via headers.

## Configuration

You can also set the Site ID and API URL via environment variables:

```bash
export HELM_SITE_ID="your-uuid"
export HELM_API_URL="https://analytics.your-domain.com"
```
