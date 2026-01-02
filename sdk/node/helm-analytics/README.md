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
