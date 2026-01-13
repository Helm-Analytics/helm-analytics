package helm

import (
	"bytes"
	"encoding/json"
	"log"
	"net"
	"net/http"
	"os"
	"strings"
	"time"
)

// Config holds the configuration for Helm Analytics
type Config struct {
	SiteID string
	APIURL string
}

// HelmAnalytics is the main client struct
type HelmAnalytics struct {
	siteID string
	apiURL string
	client *http.Client
}

// New creates a new HelmAnalytics instance
func New(cfg Config) *HelmAnalytics {
	if cfg.SiteID == "" {
		cfg.SiteID = os.Getenv("HELM_SITE_ID")
	}
	if cfg.APIURL == "" {
		cfg.APIURL = "https://api.helm-analytics.com"
	}

	// Clean URL
	cfg.APIURL = strings.TrimRight(cfg.APIURL, "/")
	cfg.APIURL = strings.Replace(cfg.APIURL, "/track", "", 1)

	return &HelmAnalytics{
		siteID: cfg.SiteID,
		apiURL: cfg.APIURL,
		client: &http.Client{
			Timeout: 5 * time.Second,
		},
	}
}

// CheckShieldSync performs a synchronous check against the firewall.
// Returns denied=true if blocked.
func (h *HelmAnalytics) CheckShieldSync(payload map[string]interface{}) (denied bool, reason string) {
	if h.siteID == "" {
		return false, ""
	}

	checkPayload := map[string]interface{}{
		"siteId":    payload["siteId"],
		"ip":        payload["clientIp"],
		"userAgent": payload["userAgent"],
		"url":       payload["url"],
	}

	jsonBytes, _ := json.Marshal(checkPayload)

	req, err := http.NewRequest("POST", h.apiURL+"/api/shield/decision", bytes.NewBuffer(jsonBytes))
	if err != nil {
		log.Printf("Helm Shield Error: %v", err)
		return false, "error_create_req"
	}
	req.Header.Set("Content-Type", "application/json")

	// Use a shorter timeout for blocking checks
	client := &http.Client{Timeout: 2 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Helm Shield Network Error: %v", err)
		return false, "error_net" // Fail open
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		var result map[string]string
		if err := json.NewDecoder(resp.Body).Decode(&result); err == nil {
			if result["action"] == "block" {
				return true, result["reason"]
			}
		}
	}
	return false, ""
}

// Track sends an event to Helm Analytics
// If shield=true, it performs a synchronous check first and returns false if blocked.
func (h *HelmAnalytics) Track(r *http.Request, eventType string, metadata map[string]interface{}, shield bool) bool {
	if h.siteID == "" {
		return true
	}

	// Extract IP
	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip, _, _ = net.SplitHostPort(r.RemoteAddr)
	} else {
		parts := strings.Split(ip, ",")
		ip = strings.TrimSpace(parts[0])
	}

	// Session ID from header or request context
	sessionID := r.Header.Get("X-Helm-Session-Id")

	// Prepare Payload
	payload := map[string]interface{}{
		"siteId":       h.siteID,
		"sessionId":    sessionID,
		"url":          h.getFullURL(r),
		"clientIp":     ip,
		"userAgent":    r.UserAgent(),
		"referrer":     r.Referer(),
		"eventType":    eventType,
		"screenWidth":  0,
		"isServerSide": true,
	}
	
	for k, v := range metadata {
		payload[k] = v
	}

	// Shield Check
	if shield {
		denied, reason := h.CheckShieldSync(payload)
		if denied {
			log.Printf("[Helm Shield] Blocked IP %s. Reason: %s", ip, reason)
			return false
		}
	}

	// Fire and forget tracking
	go h.send(payload, "/track")
	return true
}

// TrackEvent sends a custom event to Helm Analytics
func (h *HelmAnalytics) TrackEvent(r *http.Request, eventName string, properties map[string]interface{}) bool {
	if h.siteID == "" {
		return true
	}

	// Session ID from header
	sessionID := r.Header.Get("X-Helm-Session-Id")

	payload := map[string]interface{}{
		"siteId":     h.siteID,
		"sessionId":  sessionID,
		"eventName":  eventName,
		"properties": properties,
		"url":        h.getFullURL(r),
		"referrer":   r.Referer(),
	}

	go h.send(payload, "/track/event")
	return true
}

func (h *HelmAnalytics) send(payload map[string]interface{}, path string) {
	jsonBytes, _ := json.Marshal(payload)
	req, _ := http.NewRequest("POST", h.apiURL+path, bytes.NewBuffer(jsonBytes))
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := h.client.Do(req)
	if err != nil {
		return
	}
	defer resp.Body.Close()
}

func (h *HelmAnalytics) getFullURL(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
		scheme = "https"
	}
	return scheme + "://" + r.Host + r.URL.String()
}

// Middleware creates a standard net/http middleware
func (h *HelmAnalytics) Middleware(next http.Handler, shield bool) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		allowed := h.Track(r, "pageview", nil, shield)
		if !allowed {
			http.Error(w, "Forbidden by Helm Aegis", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}
