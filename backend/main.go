package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"

	//	_ "helm-analytics/docs"
	sentinel "helm-analytics/src"

	"github.com/rs/cors"
	httpSwagger "github.com/swaggo/http-swagger"
)

// @title Sentinel API
// @version 1.0
// @description This is a sample server for a web analytics platform.
// @termsOfService http://swagger.io/terms/

// @contact.name API Support
// @contact.url http://www.swagger.io/support
// @contact.email support@swagger.io

// @license.name Apache 2.0
// @license.url http://www.apache.org/licenses/LICENSE-2.0.html

// @host localhost:6060
// @BasePath /
func main() {
	// All functions from your library are now prefixed with 'sentinel.'
	sentinel.InitDB()
	sentinel.InitAnalyticsEngine()
	
	// Initialize rate limiter: 12000 requests per minute per IP for tracking (accommodates high-volume heatmaps/sessions)
	trackLimiter := sentinel.NewRateLimiter(12000, time.Minute)
	
	// Initialize license system
	if err := sentinel.InitLicense(); err != nil {
		log.Printf("⚠️  License initialization warning: %v", err)
	}
	sentinel.InitClickHouse()

	mux := http.NewServeMux()

	// Health check endpoint (public, no auth)
	mux.HandleFunc("/health", sentinel.HealthCheckHandler)

	// --- FRONTEND & STATIC ASSETS ---
	// Serve the React app and assets from the ./static folder
	rootFs := http.FileServer(http.Dir("./static"))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Clean the path to prevent directory traversal
		cleanPath := filepath.Clean(r.URL.Path)

		// 1. If it's the root, serve index.html
		if cleanPath == "/" {
			http.ServeFile(w, r, "./static/index.html")
			return
		}

		// 2. Check if the file exists in the static directory
		fpath := filepath.Join("./static", cleanPath)
		if info, err := os.Stat(fpath); err == nil && !info.IsDir() {
			rootFs.ServeHTTP(w, r)
			return
		}

		// 3. Fallback: serve index.html for SPA routes (e.g., /dashboard, /login)
		// but ONLY if it doesn't look like an API or static asset request
		http.ServeFile(w, r, "./static/index.html")
	})

	// FIX: CORS spec forbids AllowedOrigins=["*"] with AllowCredentials=true.
	// Use AllowOriginFunc to dynamically allow any origin while supporting cookies.
	trackCors := cors.New(cors.Options{
		AllowOriginFunc:  func(origin string) bool { return true }, // Allows any origin
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"},
		AllowCredentials: true,
	})

	// Strict CORS for the dashboard and API
	// trackCors := cors.New(cors.Options{
	// 	AllowedOrigins:   []string{"https://app.helm-analytics.com", "https://helm-analytics.com", "http://localhost:5173"},
	// 	AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
	// 	AllowedHeaders:   []string{"Content-Type", "Authorization"},
	// 	AllowCredentials: true,
	// })

	// --- Public API Routes ---
	mux.Handle("/auth/signup", trackCors.Handler(http.HandlerFunc(sentinel.SignupHandler)))
	mux.Handle("/auth/login", trackCors.Handler(http.HandlerFunc(sentinel.LoginHandler)))
	mux.Handle("/auth/demo/init", trackCors.Handler(http.HandlerFunc(sentinel.InitDemoHandler))) // Demo Init
	// Public tracking endpoints (no auth required)
	mux.Handle("/track", trackCors.Handler(http.HandlerFunc(sentinel.TrackHandler)))
	mux.Handle("/track/event", trackCors.Handler(http.HandlerFunc(sentinel.TrackCustomEventHandler))) // Custom events
	// mux.Handle("/api/debug/latest", trackCors.Handler(http.HandlerFunc(sentinel.DebugLatestEventsHandler)))
	// mux.Handle("/api/debug/visit-time", trackCors.Handler(http.HandlerFunc(sentinel.DebugAvgVisitTimeHandler)))
	// mux.Handle("/api/debug/session", trackCors.Handler(http.HandlerFunc(sentinel.DebugSessionEventsHandler)))
	mux.Handle("/track/click", trackCors.Handler(http.HandlerFunc(sentinel.ClickHandler)))
	mux.Handle("/session", trackCors.Handler(http.HandlerFunc(sentinel.SessionHandler)))

	mux.Handle("/api/session", trackCors.Handler(http.HandlerFunc(sentinel.SessionHandler)))
	mux.Handle("/api/users", trackCors.Handler(http.HandlerFunc(sentinel.GetAllUsersHandler)))

	// --- Protected API Routes ---
	mux.Handle("/logout", trackCors.Handler(sentinel.AuthMiddleware(sentinel.LogoutHandler)))
	mux.Handle("/api/sites/", trackCors.Handler(sentinel.AuthMiddleware(sentinel.SitesApiHandler)))
		// Analytics API (Protected)
	mux.Handle("/api/dashboard", trackCors.Handler(sentinel.AuthMiddleware(sentinel.DashboardApiHandler)))
	mux.Handle("/api/heatmap", trackCors.Handler(sentinel.AuthMiddleware(sentinel.GetHeatmapDataHandler)))
	mux.Handle("/api/firewall", trackCors.Handler(sentinel.AuthMiddleware(sentinel.FirewallApiHandler)))
	mux.Handle("/api/session/events", trackCors.Handler(sentinel.AuthMiddleware(sentinel.GetSessionEventsHandler)))
	mux.Handle("/api/sessions", trackCors.Handler(sentinel.AuthMiddleware(sentinel.ListSessionsHandler)))
	mux.Handle("/api/funnels/", trackCors.Handler(sentinel.AuthMiddleware(sentinel.FunnelsApiHandler)))
	
	// Custom Events API
	mux.Handle("/api/custom-events", trackCors.Handler(sentinel.AuthMiddleware(sentinel.GetCustomEventsHandler)))
	mux.Handle("/api/events/stats", trackCors.Handler(sentinel.AuthMiddleware(sentinel.GetCustomEventsHandler)))
	mux.Handle("/api/events/properties", trackCors.Handler(sentinel.AuthMiddleware(sentinel.GetEventPropertiesHandler)))
	
	// Activity Log API
	mux.Handle("/api/activity", trackCors.Handler(sentinel.AuthMiddleware(sentinel.GetActivityLogHandler)))

	// Campaign & Attribution API
	mux.Handle("/api/campaigns", trackCors.Handler(sentinel.AuthMiddleware(sentinel.GetCampaignStatsHandler)))

	// Engagement API (Scroll Depth)
	mux.Handle("/api/engagement", trackCors.Handler(sentinel.AuthMiddleware(sentinel.GetEngagementStatsHandler)))
	

	// Swagger documentation
	mux.Handle("/docs/", httpSwagger.Handler(
		httpSwagger.URL("/static/swagger.yaml"), // The url pointing to API definition
	))

	port := os.Getenv("PORT")
	if port == "" {
		port = "6060"
	}

	log.Printf("HELM BACKEND: Analytics Fixes Applied (v2.1) - Starting server on :%s\n", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}
}

