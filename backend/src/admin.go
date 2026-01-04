package sentinel

import (
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

// AdminUpdateSubscriptionRequest for manually setting user subscription
type AdminUpdateSubscriptionRequest struct {
	Email  string `json:"email"`
	Plan   string `json:"plan"`   // "starter", "growth", "business"
	Status string `json:"status"` // "active", "cancelled", "past_due"
}

// AdminUpdateSubscriptionHandler manually updates a user's subscription
// Protected by admin API key
func AdminUpdateSubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Check admin API key
	adminKey := r.Header.Get("X-Admin-Key")
	expectedKey := os.Getenv("ADMIN_API_KEY")
	
	if adminKey == "" || expectedKey == "" || adminKey != expectedKey {
		log.Printf("⚠️  Unauthorized admin access attempt from %s", getClientIP(r))
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	var req AdminUpdateSubscriptionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Email == "" || req.Plan == "" {
		http.Error(w, "email and plan are required", http.StatusBadRequest)
		return
	}

	// Validate plan
	validPlans := map[string]bool{
		"starter":  true,
		"growth":   true,
		"business": true,
	}
	if !validPlans[req.Plan] {
		http.Error(w, "Invalid plan. Must be: starter, growth, or business", http.StatusBadRequest)
		return
	}

	// Default status to active
	if req.Status == "" {
		req.Status = "active"
	}

	// Get user by email
	var userID string
	err := db.QueryRow("SELECT id FROM users WHERE email = $1", req.Email).Scan(&userID)
	if err == sql.ErrNoRows {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	if err != nil {
		log.Printf("Error finding user: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Check if subscription exists
	var existingSubID string
	err = db.QueryRow("SELECT id FROM subscriptions WHERE user_id = $1", userID).Scan(&existingSubID)

	if err == sql.ErrNoRows {
		// Create new subscription
		_, err = db.Exec(`
			INSERT INTO subscriptions (user_id, plan, status, stripe_subscription_id, stripe_customer_id, current_period_end)
			VALUES ($1, $2, $3, $4, $5, $6)
		`, userID, req.Plan, req.Status, "manual_"+userID, "manual_customer", time.Now().AddDate(1, 0, 0))

		if err != nil {
			log.Printf("Error creating subscription: %v", err)
			http.Error(w, "Failed to create subscription", http.StatusInternalServerError)
			return
		}

		log.Printf("✅ Admin created subscription for %s - Plan: %s", req.Email, req.Plan)
	} else if err == nil {
		// Update existing subscription
		_, err = db.Exec(`
			UPDATE subscriptions 
			SET plan = $1, status = $2, updated_at = NOW()
			WHERE user_id = $3
		`, req.Plan, req.Status, userID)

		if err != nil {
			log.Printf("Error updating subscription: %v", err)
			http.Error(w, "Failed to update subscription", http.StatusInternalServerError)
			return
		}

		log.Printf("✅ Admin updated subscription for %s - Plan: %s, Status: %s", req.Email, req.Plan, req.Status)
	} else {
		log.Printf("Error checking subscription: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Return success
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Subscription updated successfully",
		"user_id": userID,
		"email":   req.Email,
		"plan":    req.Plan,
		"status":  req.Status,
	})
}

// AdminGetUserSubscriptionHandler retrieves a user's subscription by email
func AdminGetUserSubscriptionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Check admin API key
	adminKey := r.Header.Get("X-Admin-Key")
	expectedKey := os.Getenv("ADMIN_API_KEY")
	
	if adminKey == "" || expectedKey == "" || adminKey != expectedKey {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	email := r.URL.Query().Get("email")
	if email == "" {
		http.Error(w, "email parameter is required", http.StatusBadRequest)
		return
	}

	// Get user and subscription
	var userID, plan, status, stripeSubID string
	var currentPeriodEnd time.Time

	err := db.QueryRow(`
		SELECT u.id, COALESCE(s.plan, ''), COALESCE(s.status, ''), 
		       COALESCE(s.stripe_subscription_id, ''), COALESCE(s.current_period_end, NOW())
		FROM users u
		LEFT JOIN subscriptions s ON u.id = s.user_id
		WHERE u.email = $1
	`, email).Scan(&userID, &plan, &status, &stripeSubID, &currentPeriodEnd)

	if err == sql.ErrNoRows {
		http.Error(w, "User not found", http.StatusNotFound)
		return
	}
	if err != nil {
		log.Printf("Error fetching user subscription: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user_id":             userID,
		"email":               email,
		"plan":                plan,
		"status":              status,
		"stripe_subscription": stripeSubID,
		"period_end":          currentPeriodEnd.Format("2006-01-02"),
	})
}
