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

	// --- CORS Policies ---
	// Permissive CORS for the tracking endpoint
	trackCors := cors.New(cors.Options{
		AllowedOrigins: []string{"*"},
		AllowedMethods: []string{"POST", "OPTIONS"},
		AllowedHeaders: []string{"Content-Type"},
	})

	// Strict CORS for the dashboard and API
	apiCors := cors.New(cors.Options{
		AllowedOrigins:   []string{"https://sentinel-mvp.getmusterup.com", "https://sentinel.getmusterup.com", "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	})

	// --- Public API Routes ---
	mux.Handle("/auth/signup", apiCors.Handler(http.HandlerFunc(sentinel.SignupHandler)))
	mux.Handle("/auth/login", apiCors.Handler(http.HandlerFunc(sentinel.LoginHandler)))
	// Public tracking endpoints (no auth required)
	mux.Handle("/track", trackCors.Handler(http.HandlerFunc(sentinel.TrackHandler)))
	mux.Handle("/track/event", trackCors.Handler(http.HandlerFunc(sentinel.TrackCustomEventHandler))) // Custom events
	mux.Handle("/api/debug/latest", trackCors.Handler(http.HandlerFunc(sentinel.DebugLatestEventsHandler)))
	mux.Handle("/api/debug/visit-time", trackCors.Handler(http.HandlerFunc(sentinel.DebugAvgVisitTimeHandler)))
	mux.Handle("/api/debug/session", trackCors.Handler(http.HandlerFunc(sentinel.DebugSessionEventsHandler)))
	mux.Handle("/api/debug/errors", trackCors.Handler(http.HandlerFunc(sentinel.DebugErrorsHandler)))
	mux.Handle("/track/click", trackCors.Handler(http.HandlerFunc(sentinel.ClickHandler)))
	mux.Handle("/track/error", trackCors.Handler(http.HandlerFunc(sentinel.ErrorHandler)))
	mux.Handle("/session", trackCors.Handler(http.HandlerFunc(sentinel.SessionHandler)))
	mux.Handle("/track/trap", trackCors.Handler(http.HandlerFunc(sentinel.SpiderTrapHandler))) // Advanced Bot Trap
	mux.Handle("/api/shield/decision", trackCors.Handler(http.HandlerFunc(sentinel.CheckAccessHandler))) // Shield Decision Endpoint

	mux.Handle("/api/session", trackCors.Handler(http.HandlerFunc(sentinel.SessionHandler)))
	mux.Handle("/api/users", apiCors.Handler(http.HandlerFunc(sentinel.GetAllUsersHandler)))

	// --- Protected API Routes ---
	mux.Handle("/logout", apiCors.Handler(sentinel.AuthMiddleware(sentinel.LogoutHandler)))
	mux.Handle("/api/sites/", apiCors.Handler(sentinel.AuthMiddleware(sentinel.SitesApiHandler)))
		// Analytics API (Protected)
	mux.Handle("/api/dashboard", apiCors.Handler(sentinel.AuthMiddleware(sentinel.DashboardApiHandler)))
	mux.Handle("/api/heatmap", apiCors.Handler(sentinel.AuthMiddleware(sentinel.GetHeatmapDataHandler)))
	mux.Handle("/api/errors", apiCors.Handler(sentinel.AuthMiddleware(sentinel.GetErrorsStatsHandler)))
	mux.Handle("/api/firewall", apiCors.Handler(sentinel.AuthMiddleware(sentinel.FirewallApiHandler)))
	mux.Handle("/api/session/events", apiCors.Handler(sentinel.AuthMiddleware(sentinel.GetSessionEventsHandler)))
	mux.Handle("/api/sessions", apiCors.Handler(sentinel.AuthMiddleware(sentinel.ListSessionsHandler)))
	mux.Handle("/api/funnels/", apiCors.Handler(sentinel.AuthMiddleware(sentinel.FunnelsApiHandler)))
	
	// Custom Events API
	mux.Handle("/api/custom-events", apiCors.Handler(sentinel.AuthMiddleware(sentinel.GetCustomEventsHandler)))
	mux.Handle("/api/events/stats", apiCors.Handler(sentinel.AuthMiddleware(sentinel.GetCustomEventsHandler)))
	mux.Handle("/api/events/properties", apiCors.Handler(sentinel.AuthMiddleware(sentinel.GetEventPropertiesHandler)))
	
	// Activity Log API
	mux.Handle("/api/activity", apiCors.Handler(sentinel.AuthMiddleware(sentinel.GetActivityLogHandler)))
	
	// Admin API (Cloud only - for manual subscription management)
	mux.HandleFunc("/api/admin/subscription", sentinel.AdminUpdateSubscriptionHandler)
	mux.HandleFunc("/api/admin/subscription/get", sentinel.AdminGetUserSubscriptionHandler)
	
	// AI Features
	mux.Handle("/api/ai/insights", apiCors.Handler(sentinel.AuthMiddleware(sentinel.GetInsightsHandler)))
	mux.Handle("/api/ai/chat", apiCors.Handler(sentinel.AuthMiddleware(sentinel.ChatHandler)))
	mux.Handle("/api/ai/analyze-error", apiCors.Handler(sentinel.AuthMiddleware(sentinel.AnalyzeErrorHandler)))

	// Swagger documentation
	mux.Handle("/docs/", httpSwagger.Handler(
		httpSwagger.URL("/static/swagger.yaml"), // The url pointing to API definition
	))

	log.Println("HELM BACKEND: Analytics Fixes Applied (v2.1) - Starting server on :6060")
	if err := http.ListenAndServe(":6060", mux); err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}
}

