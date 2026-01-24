package main

import (
	"log"
	"net/http"

	//	_ "sentinel-backend/docs"
	sentinel "sentinel-backend/src"

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
	
	// Initialize license system
	if err := sentinel.InitLicense(); err != nil {
		log.Printf("⚠️  License initialization warning: %v", err)
	}
	sentinel.InitClickHouse()

	mux := http.NewServeMux()

	// The file server now needs to look inside the 'static' folder
	// which will be created in the Docker container.
	fs := http.FileServer(http.Dir("./static"))
	mux.Handle("/static/", http.StripPrefix("/static/", fs))

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
	mux.Handle("/api/debug/latest", trackCors.Handler(http.HandlerFunc(sentinel.DebugLatestEventsHandler)))
	mux.Handle("/api/debug/visit-time", trackCors.Handler(http.HandlerFunc(sentinel.DebugAvgVisitTimeHandler)))
	mux.Handle("/api/debug/session", trackCors.Handler(http.HandlerFunc(sentinel.DebugSessionEventsHandler)))
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

	log.Println("HELM BACKEND: Analytics Fixes Applied (v2.1) - Starting server on :6060")
	if err := http.ListenAndServe(":6060", mux); err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}
}

