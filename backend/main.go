package main

import (
	"log"
	"net/http"
	"os"
	"strings"

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

	// --- CORS Policies (Global) ---
	// We are moving to a GLOBAL middleware to prevent "missing header" errors on prelights/errors.
	allowedOriginsEnv := os.Getenv("ALLOWED_ORIGINS")
	log.Printf("🔥 CORS CONFIG: Loaded ALLOWED_ORIGINS: '%s'", allowedOriginsEnv)

	var allowedOrigins []string
	var allowOriginFunc func(origin string) bool

	if allowedOriginsEnv == "" {
		// Default dev/fallback
		allowedOrigins = []string{"http://localhost:5173", "https://app.helm-analytics.com", "https://helm-analytics.com"}
		log.Println("⚠️ CORS: ALLOWED_ORIGINS not set, using defaults.")
	} else if allowedOriginsEnv == "*" {
		// Explicit Wildcard Mode
		log.Println("🌍 CORS: Wildcard Mode Enabled (Authorizing ALL origins)")
		allowOriginFunc = func(origin string) bool { return true }
	} else {
		// Explicit List Mode
		allowedOrigins = strings.Split(allowedOriginsEnv, ",")
		for i := range allowedOrigins {
			allowedOrigins[i] = strings.TrimSpace(allowedOrigins[i])
		}
		log.Printf("🔒 CORS: Strict Mode Enabled. Allowed: %v", allowedOrigins)
	}

	// Create the Global CORS handler
	globalCors := cors.New(cors.Options{
		AllowedOrigins:   allowedOrigins,
		AllowOriginFunc:  allowOriginFunc,
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"},
		AllowedHeaders:   []string{"Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"},
		AllowCredentials: true,
		// Debug: true, // Uncomment for verbose CORS logs if needed
	})

	// --- Routes (No local CORS wrappers anymore) ---
	
	// Auth
	mux.HandleFunc("/auth/signup", sentinel.SignupHandler)
	mux.HandleFunc("/auth/login", sentinel.LoginHandler)
	mux.Handle("/logout", sentinel.AuthMiddleware(sentinel.LogoutHandler))

	// Tracking (Public)
	mux.HandleFunc("/track", sentinel.TrackHandler)
	mux.HandleFunc("/track/event", sentinel.TrackCustomEventHandler)
	mux.HandleFunc("/track/click", sentinel.ClickHandler)
	mux.HandleFunc("/track/error", sentinel.ErrorHandler)
	mux.HandleFunc("/track/trap", sentinel.SpiderTrapHandler) 
	mux.HandleFunc("/session", sentinel.SessionHandler)
	
	// API Debug
	mux.HandleFunc("/api/debug/latest", sentinel.DebugLatestEventsHandler)
	mux.HandleFunc("/api/debug/visit-time", sentinel.DebugAvgVisitTimeHandler)
	mux.HandleFunc("/api/debug/session", sentinel.DebugSessionEventsHandler)
	mux.HandleFunc("/api/debug/errors", sentinel.DebugErrorsHandler)

	// API Protected
	mux.HandleFunc("/api/shield/decision", sentinel.CheckAccessHandler) 
	mux.HandleFunc("/api/session", sentinel.SessionHandler)
	mux.Handle("/api/users", sentinel.AuthMiddleware(sentinel.GetAllUsersHandler))
	
	mux.Handle("/api/sites/", sentinel.AuthMiddleware(sentinel.SitesApiHandler))
	mux.Handle("/api/dashboard", sentinel.AuthMiddleware(sentinel.DashboardApiHandler))
	mux.Handle("/api/heatmap", sentinel.AuthMiddleware(sentinel.GetHeatmapDataHandler))
	mux.Handle("/api/errors", sentinel.AuthMiddleware(sentinel.GetErrorsStatsHandler))
	mux.Handle("/api/firewall", sentinel.AuthMiddleware(sentinel.FirewallApiHandler))
	mux.Handle("/api/session/events", sentinel.AuthMiddleware(sentinel.GetSessionEventsHandler))
	mux.Handle("/api/sessions", sentinel.AuthMiddleware(sentinel.ListSessionsHandler))
	mux.Handle("/api/funnels/", sentinel.AuthMiddleware(sentinel.FunnelsApiHandler))
	
	mux.Handle("/api/custom-events", sentinel.AuthMiddleware(sentinel.GetCustomEventsHandler))
	mux.Handle("/api/events/stats", sentinel.AuthMiddleware(sentinel.GetCustomEventsHandler))
	mux.Handle("/api/events/properties", sentinel.AuthMiddleware(sentinel.GetEventPropertiesHandler))
	mux.Handle("/api/activity", sentinel.AuthMiddleware(sentinel.GetActivityLogHandler))
	mux.Handle("/api/campaigns", sentinel.AuthMiddleware(sentinel.GetCampaignStatsHandler))
	mux.Handle("/api/user-flow", sentinel.AuthMiddleware(sentinel.GetUserFlowHandler))
	mux.Handle("/api/engagement", sentinel.AuthMiddleware(sentinel.GetEngagementStatsHandler))
	
	mux.HandleFunc("/api/admin/subscription", sentinel.AdminUpdateSubscriptionHandler)
	mux.HandleFunc("/api/admin/subscription/get", sentinel.AdminGetUserSubscriptionHandler)
	
	mux.Handle("/api/ai/insights", sentinel.AuthMiddleware(sentinel.GetInsightsHandler))
	mux.Handle("/api/ai/chat", sentinel.AuthMiddleware(sentinel.ChatHandler))
	mux.Handle("/api/ai/analyze-error", sentinel.AuthMiddleware(sentinel.AnalyzeErrorHandler))

	// Documentation
	mux.Handle("/docs/", httpSwagger.Handler(
		httpSwagger.URL("/static/swagger.yaml"),
	))

	log.Println("HELM BACKEND: Global CORS Middleware Applied (v1.6) - Starting server on :6060")
	
	// Wrap the entire mux with the global CORS handler
	handler := globalCors.Handler(mux)
	
	if err := http.ListenAndServe(":6060", handler); err != nil {
		log.Fatalf("Could not start server: %s\n", err)
	}
}

