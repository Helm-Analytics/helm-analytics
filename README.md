# Helm Analytics 🚀

[![License](https://img.shields.io/badge/license-AGPLv3-blue.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/docker-ready-brightgreen.svg)]()
[![Deployment](https://img.shields.io/badge/deploy-dokploy-purple.svg)]()
[![Version](https://img.shields.io/badge/version-2.0-orange.svg)]()

> **The First Open-Source Website Intelligence Platform with AI-Powered Insights and Built-In Security**

Helm Analytics is not just another analytics tool. It's a complete **Website Intelligence Platform** that combines privacy-first analytics, AI-powered insights, and advanced security features in one elegant, self-hostable solution.

**Stop choosing between privacy, power, and protection. Get all three.**

[🌐 Live Demo](https://sentinel-mvp.getmusterup.com) | [📖 Documentation](https://docs.helm.io) | [💬 Discord Community](https://discord.gg/helm) | [💵 Pricing](https://helm.io/pricing)

---

## 📋 Table of Contents

- [Why Helm Analytics?](#why-helm-analytics)
- [Key Features](#key-features)
- [Tracker Script Versions](#tracker-script-versions)
- [Quick Start](#quick-start)
- [Installation Methods](#installation-methods)
- [Tracking Script Integration](#tracking-script-integration)
- [Custom Events](#custom-events)
- [Server-Side SDKs](#server-side-sdks)
- [Self-Hosting Configuration](#self-hosting-configuration)
- [Environment Variables](#environment-variables)
- [Upgrading](#upgrading)
- [Architecture](#architecture)
- [Security Features](#security-features)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 🎯 Why Helm Analytics?

The web analytics landscape is broken. You're forced to choose between:
- **Privacy-invasive tools** (Google Analytics) that treat your users' data as a product
- **Overly simplistic tools** that lack actionable insights
- **Separate tools** for analytics, security, and error tracking

**Helm solves all three problems in one platform.**

### What Makes Helm Different?

#### 1. **Privacy-First, Not Privacy-Afterthought**
- ✅ **No cookies** - Fully cookieless tracking
- ✅ **GDPR/CCPA compliant** out of the box
- ✅ **No personal data collection** - Anonymous by design
- ✅ **Complete data ownership** - Your data never leaves your server (self-hosted)
- ✅ **No third-party trackers** - All tracking happens on your domain

#### 2. **AI-Powered Insights, Not Just Numbers**
- 🤖 **Automatic anomaly detection** - "Your bounce rate from mobile users in Nigeria spiked 30%"
- 🤖 **Natural language summaries** - Understand your data without being a data scientist
- 🤖 **Strategic recommendations** - Get actionable advice, not just charts
- 🤖 **Error analysis** - AI helps debug JavaScript errors with context

#### 3. **Security Built-In, Not Bolted-On**
- 🛡️ **Advanced bot detection** - TrustScore algorithm identifies suspicious traffic
- 🛡️ **Traffic Quality Score** - Single KPI (0-100) for traffic health
- 🛡️ **Firewall rules** - Block by IP, country, or data center (ASN)
- 🛡️ **Real-time threat monitoring** - See attacks as they happen

#### 4. **Self-Hostable & Open Source**
- 💰 **Free forever** (Community Edition)
- 🔒 **Complete control** - Your server, your rules
- 🔍 **Transparent code** - Audit every line
- 🌍 **No vendor lock-in** - Own your data forever

---

## ✨ Key Features

### 📊 **Core Analytics**
| Feature | Community | Pro | Cloud |
|---------|-----------|-----|-------|
| **Real-Time Dashboard** | ✅ | ✅ | ✅ |
| **Unlimited Sites & Events** | ✅ | ✅ | Based on plan |
| **Pageviews, Visitors, Sessions** | ✅ | ✅ | ✅ |
| **Top Pages & Referrers** | ✅ | ✅ | ✅ |
| **Geographic Analytics** | ✅ | ✅ | ✅ |
| **Device & Browser Breakdown** | ✅ | ✅ | ✅ |
| **UTM Campaign Tracking** | ✅ | ✅ | ✅ |
| **Custom Date Ranges** | ✅ | ✅ | ✅ |

### 🎥 **Behavior Analytics**
| Feature | Community | Pro | Cloud |
|---------|-----------|-----|-------|
| **Session Replay** | ✅ | ✅ | ✅ |
| **Click Heatmaps** | ✅ | ✅ | ✅ |
| **Scroll Depth Tracking** | ✅ | ✅ | ✅ |
| **JavaScript Error Tracking** | ✅ | ✅ | ✅ |
| **Funnels & Conversion Tracking** | ✅ | ✅ | ✅ |
| **Custom Events** | ✅ | ✅ | ✅ |
| **Web Vitals Monitoring** | ✅ | ✅ | ✅ |

### 🤖 **AI Intelligence**
| Feature | Community | Pro | Cloud |
|---------|-----------|-----|-------|
| **AI Insights (5/day)** | ✅ (BYO API Key) | ✅ Unlimited | ✅ Unlimited |
| **Anomaly Detection** | ✅ | ✅ | ✅ |
| **AI Consultant** | ❌ | ✅ | ✅ |
| **Error Analysis** | ✅ | ✅ | ✅ |
| **Natural Language Chat** | ❌ | ✅ | ✅ |

### 🛡️ **Security Features**
| Feature | Community | Pro | Cloud |
|---------|-----------|-----|-------|
| **Bot Detection** | ✅ | ✅ | ✅ |
| **Traffic Quality Score** | ✅ | ✅ | ✅ |
| **Firewall Rules** | ✅ | ✅ | ✅ |
| **Shield Auto-Block** | ❌ | ✅ | ✅ |
| **Threat Alerts** | ✅ | ✅ | ✅ |

### 🔌 **Integrations**
| Feature | Community | Pro | Cloud |
|---------|-----------|-----|-------|
| **REST API** | ✅ | ✅ | ✅ |
| **Server SDKs (Node, Python, Go)** | ✅ | ✅ | ✅ |
| **Webhooks** | ✅ | ✅ | ✅ |
| **Google Search Console** | ❌ | ✅ | ✅ |
| **Email Reports** | ❌ | ✅ | ✅ |
| **Slack Notifications** | ❌ | ✅ | ✅ |

---

## 🚀 Tracker Script Versions

Helm Analytics uses a lightweight, cookieless tracking script. We've evolved through three major versions:

### **tracker-v3.js** (Basic - 1.5KB)
**The Foundation**
```html
<script src="https://api.helm.io/static/tracker-v3.js" data-site-id="your-site-id"></script>
```

**What it tracks:**
- ✅ Pageviews
- ✅ Referrer
- ✅ Screen size

**Limitations:**
- ❌ No error tracking
- ❌ No custom events
- ❌ No session tracking
- ❌ No Web Vitals

**Recommended for:** Ultra-lightweight tracking only

---

### **tracker-v4.js** (Advanced - 8.8KB)
**The Game Changer**
```html
<script src="https://api.helm.io/static/tracker-v4.js" data-site-id="your-site-id"></script>
```

**Major upgrades from v3:**
- ✅ **Error Tracking** - Catches all JavaScript errors automatically
- ✅ **Custom Events** - `helm.trackEvent()` for tracking anything
- ✅ **Click Tracking** - Automatic outbound link detection
- ✅ **Session IDs** - Persistent session tracking across pageviews
- ✅ **Multiple Endpoints** - Optimized API routes for different event types

**What's still missing:**
- ❌ Web Vitals (LCP, FID, CLS)
- ❌ Session Replay
- ❌ Auto-tracked events (file downloads, scroll depth)

**Recommended for:** Production sites needing custom events and error tracking

---

### **tracker-v5.js** (Complete - 12KB) ⭐ **CURRENT & RECOMMENDED**
**The Full Intelligence Platform**
```html
<script src="https://api.helm.io/static/tracker-v5.js" data-site-id="your-site-id"></script>
```

**Everything in v4 PLUS:**

#### 📊 **Web Vitals Monitoring**
Automatically tracks Google's Core Web Vitals:
- **LCP** (Largest Contentful Paint) - Load performance
- **FID** (First Input Delay) - Interactivity responsiveness
- **CLS** (Cumulative Layout Shift) - Visual stability

These metrics appear in your dashboard's Performance section.

#### 🎥 **Session Replay**
- Records user sessions using **rrweb** (industry-standard library)
- Privacy-focused (excludes sensitive inputs by default)
- Replay any session to debug issues
- See exactly what users see

#### 🎯 **Auto-Tracked Events**
No code required! These are tracked automatically:
- **File Downloads** - Any link with `download` attribute
- **Outbound Clicks** - External links
- **Scroll Depth** - 25%, 50%, 75%, 100% milestones

#### ⚡ **Enhanced Custom Events**
More powerful event tracking:
```javascript
helm.trackEvent('purchase', {
  amount: 99.99,
  currency: 'USD',
  product_id: '12345',
  category: 'subscription'
});
```

#### 🔐 **Better Session Management**
- Session persistence across page loads
- Improved visitor identification
- Better handling of returning users

#### 🌍 **Auto-Detects API URL for Self-Hosters**
**No configuration needed!** The script automatically detects its source:

```html
<!-- Self-hosted - AUTOMATIC API detection -->
<script src="http://localhost:6060/static/tracker-v5.js" 
  data-site-id="abc123"></script>
<!-- ✅ Automatically uses: http://localhost:6060 -->

<!-- Custom domain - AUTOMATIC -->
<script src="https://analytics.mycompany.com/static/tracker-v5.js" 
  data-site-id="abc123"></script>
<!-- ✅ Automatically uses: https://analytics.mycompany.com -->

<!-- Manual override (if needed) -->
<script src="http://localhost:6060/static/tracker-v5.js" 
  data-site-id="abc123"
  data-api="http://different-server:6060"></script>
```

### **Version Comparison Table**

| Feature | v3 | v4 | v5 |
|---------|----|----|---- |
| **File Size** | 1.5KB | 8.8KB | **12KB** |
| **Pageviews** | ✅ | ✅ | ✅ |
| **Custom Events** | ❌ | ✅ | ✅ |
| **Error Tracking** | ❌ | ✅ | ✅ |
| **Click Tracking** | ❌ | ✅ | ✅ |
| **Session Tracking** | ❌ | ✅ | ✅ |
| **Web Vitals (LCP, FID, CLS)** | ❌ | ❌ | **✅** |
| **Session Replay** | ❌ | ❌ | **✅** |
| **Auto File Downloads** | ❌ | ❌ | **✅** |
| **Auto Scroll Depth** | ❌ | ❌ | **✅** |
| **Auto API Detection** | ❌ | ❌ | **✅** |

### **Performance Impact**

All versions are designed for **zero impact** on your Core Web Vitals:
- ✅ **Async loading** - Never blocks page rendering
- ✅ **No cookies** - No GDPR consent banners needed
- ✅ **Tiny footprint** - Even v5 at 12KB compresses to ~4KB gzipped
- ✅ **Edge-optimized** - Works with Cloudflare, Vercel, Netlify

---

## 🏁 Quick Start

Get Helm running on your local machine in **under 5 minutes**.

### Prerequisites
- **Docker** & **Docker Compose** installed
- **2GB RAM** minimum
- **Ports 3000 & 6060** available

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Helm-Analytics/sentinel-mvp.git
cd sentinel-mvp

# 2. Copy environment file
cp .env.example .env

# 3. Generate secure secrets
echo "SESSION_SECRET=$(openssl rand -base64 32)" >> .env
echo "JWT_SECRET=$(openssl rand -base64 32)" >> .env

# 4. Start all services
docker-compose up -d

# 5. Wait for services to initialize (30-60 seconds)
docker-compose logs -f backend

# 6. Open dashboard
# Frontend: http://localhost:8012
# Backend API: http://localhost:6060
```

### First Steps

1. **Create your account** at `http://localhost:8012`
2. **Add your first website**
3. **Copy the tracking script**
4. **Add it to your website** (just before `</body>`)
5. **Watch data flow in!**

---

## 📦 Installation Methods

### Method 1: Docker Compose (Recommended for Self-Hosting)

**For local development and community self-hosting:**

```bash
# Use the default docker-compose.yml
docker-compose up -d
```

This starts:
- **Backend** (Go) on `localhost:6060`
- **Frontend** (React) on `localhost:8012`
- **PostgreSQL** (user data, sites, sessions)
- **ClickHouse** (events, analytics)

---

### Method 2: Dokploy Cloud Deployment

**For production cloud deployment:**

```bash
# Clone repository
git clone https://github.com/Helm-Analytics/sentinel-mvp.git
cd sentinel-mvp

# Dokploy uses docker-compose.cloud.yml automatically
# Configure environment variables in Dokploy dashboard:
# - DEPLOYMENT_MODE=cloud
# - DATABASE_URL=<your-postgres-url>
# - CLICKHOUSE_URL=http://clickhouse:9000
# - CORS_ORIGIN=https://your-frontend-domain.com
# - SESSION_SECRET=<random-string>
# - JWT_SECRET=<random-string>
# - ADMIN_API_KEY=<random-string>
# - GEMINI_API_KEY=<your-gemini-key>
# - STRIPE_SECRET_KEY=<your-stripe-key> (if using Stripe)
# - PAYSTACK_SECRET_KEY=<your-paystack-key> (if using Paystack)

# Deploy via Dokploy UI
```

**Key differences in `docker-compose.cloud.yml`:**
- ✅ No port mappings (Dokploy/Traefik handles routing)
- ✅ Uses Docker Hub images instead of building locally
- ✅ Optimized for production

For detailed Dokploy setup, see [dokploy_env_setup.md](docs/dokploy_env_setup.md)

---

### Method 3: Manual Installation

**For custom setups:**

**Backend:**
```bash
cd backend
go mod download
go build -o helm-backend
./helm-backend
```

**Frontend:**
```bash
cd frontend
npm install
npm run build
npm run preview
```

**Requirements:**
- Go 1.21+
- Node.js 18+
- PostgreSQL 14+
- ClickHouse 23+

---

## 🔗 Tracking Script Integration

### Basic Integration

Add this script just before the closing `</body>` tag on every page you want to track:

```html
<!DOCTYPE html>
<html>
<head>
    <title>My Website</title>
</head>
<body>
    <!-- Your content here -->
    
    <!-- Helm Analytics - Add before </body> -->
    <script src="https://api-sentinel.getmusterup.com/static/tracker-v5.js" 
      data-site-id="your-site-id"></script>
</body>
</html>
```

**Self-hosted? The script auto-detects your API URL:**

```html
<!-- Self-hosted - automatically uses http://localhost:6060 -->
<script src="http://localhost:6060/static/tracker-v5.js" 
  data-site-id="your-site-id"></script>
```

### What Gets Tracked Automatically

Once installed, **zero configuration needed** for:

✅ **Pageviews** - Every page visit
✅ **Referrers** - Where visitors came from
✅ **Geographic data** - Country, region (via IP)
✅ **Device info** - Browser, OS, screen size
✅ **Session tracking** - Visitor sessions
✅ **Web Vitals** - LCP, FID, CLS
✅ **JavaScript errors** - All uncaught errors
✅ **File downloads** - Any `<a download>` clicks
✅ **Outbound links** - External link clicks
✅ **Scroll depth** - 25%, 50%, 75%, 100%

### React Integration

```jsx
// In your React app (e.g., App.jsx or index.html)
useEffect(() => {
  const script = document.createElement('script');
  script.src = 'https://api-sentinel.getmusterup.com/static/tracker-v5.js';
  script.setAttribute('data-site-id', 'your-site-id');
  script.async = true;
  document.body.appendChild(script);
}, []);
```

### Next.js Integration

```javascript
// pages/_app.js or app/layout.js
import Script from 'next/script'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <Script 
        src="https://api-sentinel.getmusterup.com/static/tracker-v5.js"
        data-site-id="your-site-id"
        strategy="afterInteractive"
      />
    </>
  )
}
```

### Vue.js Integration

```vue
<!-- In your main App.vue or index.html -->
<script setup>
import { onMounted } from 'vue'

onMounted(() => {
  const script = document.createElement('script')
  script.src = 'https://api-sentinel.getmusterup.com/static/tracker-v5.js'
  script.setAttribute('data-site-id', 'your-site-id')
  script.async = true
  document.body.appendChild(script)
})
</script>
```

---

## 🎯 Custom Events

Track any user action with custom events.

### Client-Side Tracking (JavaScript)

The `helm` global object is available once the tracker loads:

#### **Basic Event**
```javascript
// Track a button click
helm.trackEvent('button_clicked', {
  location: 'header',
  text: 'Sign Up',
  color: 'blue'
});
```

#### **E-commerce Tracking**
```javascript
// Track a purchase
helm.trackEvent('purchase', {
  amount: 99.99,
  currency: 'USD',
  product_id: '12345',
  product_name: 'Pro License',
  category: 'subscription',
  quantity: 1
});

// Track add to cart
helm.trackEvent('add_to_cart', {
  product_id: '67890',
  product_name: 'Widget Pro',
  price: 49.99
});

// Track checkout started
helm.trackEvent('checkout_started', {
  cart_value: 149.97,
  item_count: 3
});
```

#### **Form Tracking**
```javascript
// Track form submission
document.getElementById('contact-form').addEventListener('submit', (e) => {
  helm.trackEvent('form_submitted', {
    form_name: 'contact',
    form_type: 'lead_generation'
  });
});

// Track form abandonment
let formStarted = false;
document.getElementById('signup-form').addEventListener('focus', () => {
  if (!formStarted) {
    formStarted = true;
    helm.trackEvent('form_started', { form_name: 'signup' });
  }
}, true);
```

#### **Video Tracking**
```javascript
// Track video play
document.getElementById('promo-video').addEventListener('play', () => {
  helm.trackEvent('video_played', {
    video_id: 'promo_v1',
    video_title: 'Product Demo'
  });
});

// Track video completion
document.getElementById('promo-video').addEventListener('ended', () => {
  helm.trackEvent('video_completed', {
    video_id: 'promo_v1',
    watch_time: Math.round(video.currentTime)
  });
});
```

### Real-World Examples

#### **SaaS Trial Signup**
```javascript
function handleTrialSignup() {
  helm.trackEvent('trial_started', {
    plan: 'pro',
    billing: 'monthly',
    referral_source: document.referrer
  });
}
```

#### **Blog Post Engagement**
```javascript
// Track reading time
let startTime = Date.now();
window.addEventListener('beforeunload', () => {
  const readTime = Math.round((Date.now() - startTime) / 1000);
  helm.trackEvent('article_read', {
    article_id: 'post-123',
    read_time_seconds: readTime,
    scroll_percentage: getScrollPercentage()
  });
});
```

#### **Feature Usage**
```javascript
// Track feature usage
function enableDarkMode() {
  localStorage.setItem('theme', 'dark');
  helm.trackEvent('feature_used', {
    feature: 'dark_mode',
    enabled: true
  });
}
```

---

## 🖥️ Server-Side SDKs

Track events from your backend for better security and accuracy.

### Node.js SDK

```bash
npm install @helm-analytics/node
```

```javascript
const Helm = require('@helm-analytics/node');

const helm = new Helm({
  siteId: 'your-site-id',
  apiUrl: 'https://api-sentinel.getmusterup.com' // or your self-hosted URL
});

// Track an event
helm.track({
  event: 'purchase',
  properties: {
    amount: 99.99,
    product: 'Pro License',
    user_id: 'user_123'
  }
});

// Track with user context
helm.track({
  event: 'user_upgraded',
  userId: 'user_123',
  properties: {
    from_plan: 'free',
    to_plan: 'pro'
  }
});
```

---

### Python SDK

```bash
pip install helm-analytics
```

```python
from helm_analytics import Helm

helm = Helm(
    site_id='your-site-id',
    api_url='https://api-sentinel.getmusterup.com'
)

# Track an event
helm.track(
    event='purchase',
    properties={
        'amount': 99.99,
        'product': 'Pro License',
        'user_id': 'user_123'
    }
)

# Track with IP (for geo-location)
helm.track(
    event='api_call',
    properties={'endpoint': '/api/users'},
    ip_address='203.0.113.1'
)
```

---

### Go SDK

```bash
go get github.com/helm-analytics/helm-go
```

```go
package main

import "github.com/helm-analytics/helm-go"

func main() {
    client := helm.New(helm.Config{
        SiteID: "your-site-id",
        APIUrl: "https://api-sentinel.getmusterup.com",
    })

    // Track an event
    client.Track(helm.Event{
        Name: "purchase",
        Properties: map[string]interface{}{
            "amount":  99.99,
            "product": "Pro License",
            "user_id": "user_123",
        },
    })
}
```

---

## ⚙️ Self-Hosting Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# ============================================
# DEPLOYMENT MODE
# ============================================
# Options: "community" or "cloud"
# community = Self-hosted, free, no billing
# cloud = SaaS deployment with Stripe/Paystack
DEPLOYMENT_MODE=community

# ============================================
# LICENSE (Optional - for Pro/Enterprise)
# ============================================
# Leave blank for Community Edition
# Add your license key for Pro features
LICENSE_KEY=

# You can also use a license key file:
# LICENSE_KEY_PATH=/path/to/license.key

# ============================================
# AI FEATURES (Recommended)
# ============================================
# Get your free API key: https://aistudio.google.com
GEMINI_API_KEY=your-gemini-api-key-here

# ============================================
# DATABASE CONFIGURATION
# ============================================
# PostgreSQL (stores users, sites, sessions)
DATABASE_URL=postgresql://helm:your-secure-password@postgres:5432/helm

# ClickHouse (stores events, analytics)
# For self-hosted: use container name
CLICKHOUSE_URL=http://clickhouse:9000

# ============================================
# SECURITY
# ============================================
# Generate with: openssl rand -base64 32
SESSION_SECRET=your-random-session-secret-here
JWT_SECRET=your-random-jwt-secret-here

# Admin API key (for subscription management)
ADMIN_API_KEY=your-admin-api-key

# ============================================
# CORS CONFIGURATION
# ============================================
# For self-hosted local: http://localhost:8012
# For production: https://your-frontend-domain.com
CORS_ORIGIN=http://localhost:8012

# ============================================
# CLOUD-ONLY SETTINGS (if DEPLOYMENT_MODE=cloud)
# ============================================
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Paystack (for African markets)
PAYSTACK_SECRET_KEY=

# ============================================
# OPTIONAL CONFIGURATION
# ============================================
# SMTP (for email reports - Pro feature)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=noreply@helm.io

# Slack (for notifications - Pro feature)
SLACK_WEBHOOK_URL=
```

### Generate Secure Secrets

```bash
# Generate SESSION_SECRET
openssl rand -base64 32

# Generate JWT_SECRET
openssl rand -base64 32

# Generate ADMIN_API_KEY
openssl rand -base64 32
```

---

## 🔐 Security Features

Helm includes enterprise-grade security features to protect your website from malicious traffic.

### Bot Detection

Helm's **TrustScore** algorithm analyzes every visitor:

**Scoring factors:**
- User agent analysis (known bot signatures)
- IP reputation (data center IPs, VPNs, proxies)
- Behavioral analysis (headless browsers, automation)
- Traffic patterns (abnormal request rates)

**TrustScore ranges:**
- **80-100**: Legitimate human traffic
- **50-79**: Suspicious (possible bot)
- **0-49**: Likely bot/malicious

### Traffic Quality Score

A single, at-a-glance metric (0-100) showing your overall traffic health:

```
Traffic Quality Score = % of visitors with TrustScore > 50
```

**Example:**
- ✅ **92/100** - Excellent (92% legitimate traffic)
- ⚠️ **65/100** - Concerning (35% suspicious/bot traffic)
- 🚨 **40/100** - Critical (60% non-human traffic)

### Firewall Rules

Block malicious traffic before it reaches your site:

**Block by IP:**
```
185.220.101.X (Tor exit node)
```

**Block by Country:**
```
Block all traffic from Nigeria
```

**Block by ASN (Data Center):**
```
Block ASN 16509 (Amazon AWS bots)
Block ASN 15169 (Google Cloud bots)
```

### Shield Mode (Pro/Cloud)

Automatic, server-level blocking of identified threats. No manual rules needed.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Helm Analytics                           │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Frontend   │      │   Backend    │      │  Databases   │
│   (React)    │◄────►│     (Go)     │◄────►│  (Postgres   │
│   Port 8012  │      │  Port 6060   │      │  ClickHouse) │
└──────────────┘      └──────────────┘      └──────────────┘
       │                     │
       │                     │
       │                     ▼
       │              ┌──────────────┐
       │              │  AI Engine   │
       │              │  (Gemini)    │
       │              └──────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                    Tracking Script                            │
│  tracker-v5.js (12KB) - Cookieless, Privacy-First           │
│                                                               │
│  • Pageviews          • Custom Events     • Session Replay   │
│  • Error Tracking     • Web Vitals        • Auto Events      │
└──────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- Go 1.21+
- Gin (HTTP framework)
- GORM (ORM)
- PostgreSQL (user data, sites, sessions)
- ClickHouse (events, analytics)
- Gemini AI (insights)

**Frontend:**
- React 18
- Vite (build tool)
- React Router (routing)
- Tailwind CSS (styling)
- Recharts (charts)

**Tracking:**
- Vanilla JavaScript
- rrweb (session replay)
- web-vitals (performance)

---

## 🆙 Upgrading

### Upgrading from Community to Pro

```bash
# 1. Purchase Pro license at https://helm.io/pricing

# 2. Stop services
docker-compose down

# 3. Add license key to .env
echo "LICENSE_KEY=helm_pro_xxxxxxxxxxxxx" >> .env

# 4. Restart
docker-compose up -d

# 5. Verify activation
docker-compose logs backend | grep "License activated"
```

You should see:
```
✅ License activated: PRO Edition
✅ Expiry: 2025-12-31
✅ Max Sites: Unlimited
```

### Upgrading Helm Version

```bash
# 1. Backup your data
docker-compose exec postgres pg_dump -U helm helm > backup.sql
docker-compose exec clickhouse clickhouse-client --query "SELECT * FROM events FORMAT CSV" > events_backup.csv

# 2. Pull latest code
git pull origin main

# 3. Rebuild containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 4. Check logs
docker-compose logs -f
```

---

## 🤝 Contributing

We welcome contributions from the community!

### Ways to Contribute

- 🐛 **Bug Reports** - Found a bug? [Open an issue](https://github.com/Helm-Analytics/sentinel-mvp/issues)
- 💡 **Feature Requests** - Have an idea? [Start a discussion](https://github.com/Helm-Analytics/sentinel-mvp/discussions)
- 📝 **Documentation** - Improve our docs
- 🌍 **Translations** - Help translate Helm
- 💻 **Code** - Submit a Pull Request

### Development Setup

```bash
# Clone repository
git clone https://github.com/Helm-Analytics/sentinel-mvp.git
cd sentinel-mvp

# Backend
cd backend
go mod download
go run main.go

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

### Coding Guidelines

- **Go**: Follow [Effective Go](https://golang.org/doc/effective_go)
- **JavaScript**: Use ESLint + Prettier
- **Commit Messages**: Use [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📄 License

- **Community Edition**: [AGPL-3.0](LICENSE) - Free forever, open source
- **Pro License**: Commercial license for self-hosted Pro features
- **Cloud**: Proprietary (managed by Helm)

**What does AGPL-3.0 mean?**
- ✅ Use for free (personal + commercial)
- ✅ Modify the code
- ✅ Self-host
- ⚠️ Must share modifications if you offer it as a service
- ⚠️ Must keep the source code open

**Need a commercial license?** [Contact us](mailto:sales@helm.io)

---

## 💬 Support

### Community Support (Free)
- 📚 **Documentation**: [docs.helm.io](https://docs.helm.io)
- 💬 **Discord**: [discord.gg/helm](https://discord.gg/helm)
- 🐛 **GitHub Issues**: [github.com/Helm-Analytics/sentinel-mvp/issues](https://github.com/Helm-Analytics/sentinel-mvp/issues)

### Paid Support
- **Pro License**: 24-hour response time
- **Cloud Plans**: Priority support included
- **Enterprise**: Dedicated Slack channel

📧 **Email**: support@helm.io
🌐 **Website**: [helm.io](https://helm.io)

---

## 🗺️ Roadmap

**Completed (v2.0):**
- ✅ Activity Log (real-time activity feed)
- ✅ Enhanced custom events
- ✅ Dark mode improvements
- ✅ Auto-detecting tracker script
- ✅ Comprehensive documentation

**In Progress (v2.1):**
- 🔨 User journey visualization
- 🔨 A/B testing framework
- 🔨 Advanced funnel analytics

**Planned (v2.2+):**
- 📅 Multi-site dashboards
- 📅 Custom dashboards
- 📅 Data export (CSV, JSON)
- 📅 More SDKs (PHP, Ruby, Java)

See [ROADMAP.md](ROADMAP.md) for full details.

---

## 🌍 Proudly Built by DataKriB

Helm is developed by [DataKriB](https://datakrib.com), an African tech company building open-source infrastructure for the modern web.

**Our Mission:** Make powerful, privacy-first tools accessible to everyone, everywhere.

---

## ⭐ Show Your Support

If you find Helm useful, please:
- ⭐ **Star this repository**
- 🐦 **Tweet about it**: [@HelmAnalytics](https://twitter.com/HelmAnalytics)
- 📝 **Write about it**: Blog, review, or share your experience
- 💰 **Sponsor**: [GitHub Sponsors](https://github.com/sponsors/Helm-Analytics)

**Thank you for using Helm Analytics! 🚀**

---

*Last updated: January 2026*
