# Helm Analytics Go Middleware

Official Go middleware for [Helm Analytics](https://github.com/Sentinel-Analytics/sentinel-mvp).
Track page views and block malicious traffic with **Shield Mode**.

## Installation

```bash
go get github.com/Sentinel-Analytics/sentinel-mvp/sdk/go/helm-analytics
```

## Usage

### 1. Standard Tracking

```go
package main

import (
	"net/http"
	"github.com/Sentinel-Analytics/sentinel-mvp/sdk/go/helm-analytics"
)

func main() {
	// Initialize Helm
	helm := helm.New(helm.Config{
		SiteID: "YOUR_SITE_ID",
		APIURL: "http://localhost:8080", // Or your production URL
	})

	mux := http.NewServeMux()
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("Hello World"))
	})

	// Wrap middleware (Non-blocking)
	http.ListenAndServe(":3000", helm.Middleware(mux, false))
}
```

### 2. Shield Mode (Active Blocking)

Block malicious IPs and Countries automatically.

```go
// Wrap middleware with shield=true
http.ListenAndServe(":3000", helm.Middleware(mux, true))
```

## Configuration

| Field | Description | Default |
| :--- | :--- | :--- |
| `SiteID` | Your website's UUID | `HELM_SITE_ID` env var |
| `APIURL` | Helm Backend URL | `HELM_API_URL` env var or `https://api.helm-analytics.com` |

## Features

- **Sub-millisecond overhead**: Optimized for high-throughput Go services.
- **Shield Mode**: Real-time blocking of malicious traffic.
- **Auto-UTM Extraction**: Automatically parses campaign data from `*http.Request`.
- **Customizable Metadata**: Easily attach user data or performance metrics.
