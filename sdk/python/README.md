# Helm Analytics Python SDK

Official Python middleware for [Helm Analytics](https://helm-analytics.com). Track server-side events, verify traffic quality, and bypass ad-blockers by ingesting data directly from your backend.

## Installation

```bash
pip install helm-analytics
```

## Quick Start (FastAPI)

```python
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware
from helm_analytics import HelmAnalytics

app = FastAPI()

# Initialize Helm
helm = HelmAnalytics(site_id="YOUR_SITE_ID_HERE")

# Register Middleware
app.add_middleware(BaseHTTPMiddleware, dispatch=helm.fastapi_dispatch)

@app.get("/")
def home():
    return {"message": "Hello World"}
```

## Shield Mode (Blocking)

Helm can actively block malicious requests (e.g. from banned IPs or countries) before they hit your logic.

```python
# Flask
app.before_request(helm.flask_middleware(shield=True))

# FastAPI
app.add_middleware(BaseHTTPMiddleware, dispatch=helm.fastapi_middleware(shield=True))
```

## Features

- **Non-blocking**: Uses background threads to send data without slowing down your app (unless Shield Mode is on).
- **Shield Mode**: Synchronously queries Helm to block threats at the edge.
- **Bot Detection**: Passes server context (IP, User-Agent) for deeper analysis.
- **Fail-safe**: Failures in tracking do not crash your application.

## Configuration

You can also set the Site ID via environment variable:

```bash
export HELM_SITE_ID="your-uuid"
```
