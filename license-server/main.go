package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/rs/cors"
)

type LicenseData struct {
	Tier      string    `json:"tier"`
	Customer  string    `json:"customer"`
	Email     string    `json:"email"`
	IssuedAt  time.Time `json:"issued_at"`
	ExpiresAt time.Time `json:"expires_at"`
	MaxSites  int       `json:"max_sites"`
	Features  []string  `json:"features"`
}

type ValidateRequest struct {
	LicenseKey string `json:"license_key"`
	Feature    string `json:"feature,omitempty"`
}

type ValidateResponse struct {
	Valid      bool     `json:"valid"`
	Tier       string   `json:"tier"`
	ExpiresAt  string   `json:"expires_at,omitempty"`
	Features   []string `json:"features"`
	Error      string   `json:"error,omitempty"`
	RateLimited bool    `json:"rate_limited,omitempty"`
}

var licenseSecret string

func main() {
	licenseSecret = os.Getenv("LICENSE_SECRET")
	if licenseSecret == "" {
		log.Fatal("LICENSE_SECRET environment variable is required")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	// Validate license endpoint
	mux.HandleFunc("/api/v1/validate", handleValidate)

	// CORS configuration
	c := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "OPTIONS"},
		AllowedHeaders:   []string{"*"},
		AllowCredentials: true,
	})

	handler := c.Handler(mux)

	log.Printf("🔐 License Server starting on port %s", port)
	log.Printf("📋 Endpoints:")
	log.Printf("   - POST /api/v1/validate")
	log.Printf("   - GET  /health")

	if err := http.ListenAndServe(":"+port, handler); err != nil {
		log.Fatal(err)
	}
}

func handleValidate(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req ValidateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		respondJSON(w, ValidateResponse{
			Valid: false,
			Error: "Invalid request body",
		})
		return
	}

	if req.LicenseKey == "" {
		respondJSON(w, ValidateResponse{
			Valid: false,
			Error: "License key is required",
		})
		return
	}

	// Validate the license
	license, err := decodeLicense(req.LicenseKey)
	if err != nil {
		log.Printf("Invalid license attempt: %v", err)
		respondJSON(w, ValidateResponse{
			Valid: false,
			Error: "Invalid license key",
		})
		return
	}

	// Check expiration
	if time.Now().After(license.ExpiresAt) {
		respondJSON(w, ValidateResponse{
			Valid:     false,
			Error:     "License expired",
			ExpiresAt: license.ExpiresAt.Format("2006-01-02"),
		})
		return
	}

	// Check if specific feature is requested
	if req.Feature != "" {
		hasFeature := false
		for _, f := range license.Features {
			if f == req.Feature {
				hasFeature = true
				break
			}
		}
		if !hasFeature {
			respondJSON(w, ValidateResponse{
				Valid:    false,
				Tier:     license.Tier,
				Features: license.Features,
				Error:    "Feature not available in this license",
			})
			return
		}
	}

	// Valid license
	respondJSON(w, ValidateResponse{
		Valid:     true,
		Tier:      license.Tier,
		Features:  license.Features,
		ExpiresAt: license.ExpiresAt.Format("2006-01-02"),
	})
}

func decodeLicense(licenseKey string) (*LicenseData, error) {
	// Parse key format: helm_pro_base64data or helm_ent_base64data
	parts := strings.Split(licenseKey, "_")
	if len(parts) != 3 {
		return nil, &LicenseError{"Invalid license key format"}
	}

	tier := parts[1] // "pro" or "ent"
	payload := parts[2]

	// Decode base64
	data, err := base64.StdEncoding.DecodeString(payload)
	if err != nil {
		return nil, &LicenseError{"Invalid base64 encoding"}
	}

	// Last 32 bytes are HMAC signature
	if len(data) < 32 {
		return nil, &LicenseError{"Invalid license data"}
	}

	signature := data[len(data)-32:]
	jsonData := data[:len(data)-32]

	// Verify HMAC
	h := hmac.New(sha256.New, []byte(licenseSecret))
	h.Write(jsonData)
	expectedSig := h.Sum(nil)

	if !hmac.Equal(signature, expectedSig) {
		return nil, &LicenseError{"Invalid license signature"}
	}

	// Parse JSON
	var license LicenseData
	if err := json.Unmarshal(jsonData, &license); err != nil {
		return nil, &LicenseError{"Invalid license data"}
	}

	license.Tier = tier
	return &license, nil
}

func respondJSON(w http.ResponseWriter, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

type LicenseError struct {
	Message string
}

func (e *LicenseError) Error() string {
	return e.Message
}
