package sentinel

import (
	"encoding/json"
	"log"
	"net/http"
	"time"
)

// ActivityType represents different activity types
type ActivityType string

const (
	ActivityPageview     ActivityType = "pageview"
	ActivityCustomEvent  ActivityType = "custom_event"
	ActivityVisitorNew   ActivityType = "visitor_new"
	ActivityFirewallBlock ActivityType = "firewall_block"
	ActivityError        ActivityType = "error"
)

// ActivityLogEntry represents a single activity
type ActivityLogEntry struct {
	ID           string                 `json:"id"`
	SiteID       string                 `json:"siteId"`
	ActivityType ActivityType           `json:"activityType"`
	ActivityData map[string]interface{} `json:"activityData"`
	IPAddress    string                 `json:"ipAddress"`
	Country      string                 `json:"country"`
	City         string                 `json:"city"`
	Browser      string                 `json:"browser"`
	OS           string                 `json:"os"`
	Device       string                 `json:"device"`
	CreatedAt    time.Time              `json:"createdAt"`
}

// LogActivity logs an activity to the database
func LogActivity(siteID string, activityType ActivityType, data map[string]interface{}, r *http.Request) error {
	if db == nil {
		return nil // Gracefully handle if DB not initialized
	}

	// Extract client info
	ip := getClientIP(r)
	country := getCountry(ip)
	city := getCity(ip)
	browser := getBrowser(r.UserAgent())
	os := getOS(r.UserAgent())
	device := getDevice(r.UserAgent())

	// Serialize activity data
	dataJSON, err := json.Marshal(data)
	if err != nil {
		log.Printf("Failed to marshal activity data: %v", err)
		return err
	}

	// Insert into database
	query := `
		INSERT INTO activity_log 
		(site_id, activity_type, activity_data, ip_address, country, city, browser, os, device)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`

	_, err = db.Exec(query, siteID, activityType, dataJSON, ip, country, city, browser, os, device)
	if err != nil {
		log.Printf("Failed to log activity: %v", err)
		return err
	}

	return nil
}

// GetActivityLogHandler returns activity log for a site from ClickHouse
func GetActivityLogHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	filter := r.URL.Query().Get("filter") // "all", "pageviews", "events", "visitors", "errors"
	limit := parseIntOrDefault(r.URL.Query().Get("limit"), 100)

	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	// Verify ownership
	if !verifySiteOwnership(r, siteID) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Query ClickHouse events table for unified activity view
	ctx := r.Context()
	query := `
		SELECT Timestamp, EventType, EventName, URL, 
		       ClientIP, Country, City, Browser, OS, Device, 
		       Properties, SessionID
		FROM events
		WHERE SiteID = ?
	`

	// Apply filter
	switch filter {
	case "pageviews":
		query += " AND EventType = 'pageview'"
	case "events":
		query += " AND EventType = 'custom'"
	case "errors":
		// Query errors table instead
		getErrorsActivity(w, r, siteID, limit)
		return
	}

	query += " ORDER BY Timestamp DESC LIMIT ?"

	rows, err := chConn.Query(ctx, query, siteID, limit)
	if err != nil {
		log.Printf("Failed to query activity from ClickHouse: %v", err)
		http.Error(w, "Failed to fetch activity", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type Activity struct {
		Timestamp time.Time              `json:"timestamp"`
		Type      string                 `json:"type"`
		EventName string                 `json:"eventName,omitempty"`
		URL       string                 `json:"url"`
		IP        string                 `json:"ip"`
		Country   string                 `json:"country"`
		City      string                 `json:"city"`
		Browser   string                 `json:"browser"`
		OS        string                 `json:"os"`
		Device    string                 `json:"device"`
		Data      map[string]interface{} `json:"data,omitempty"`
		SessionID string                 `json:"sessionId"`
	}

	var activities []Activity

	for rows.Next() {
		var activity Activity
		var properties string

		err := rows.Scan(
			&activity.Timestamp,
			&activity.Type,
			&activity.EventName,
			&activity.URL,
			&activity.IP,
			&activity.Country,
			&activity.City,
			&activity.Browser,
			&activity.OS,
			&activity.Device,
			&properties,
			&activity.SessionID,
		)
		if err != nil {
			log.Printf("Error scanning activity: %v", err)
			continue
		}

		// Parse properties if present
		if properties != "" && properties != "{}" {
			if err := json.Unmarshal([]byte(properties), &activity.Data); err != nil {
				activity.Data = make(map[string]interface{})
			}
		}

		activities = append(activities, activity)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"activities": activities,
		"count":      len(activities),
	})
}

// Helper function to get error activities
func getErrorsActivity(w http.ResponseWriter, r *http.Request, siteID string, limit int) {
	ctx := r.Context()
	query := `
		SELECT Timestamp, URL, Message, Source, LineNo, ClientIP
		FROM errors
		WHERE SiteID = ?
		ORDER BY Timestamp DESC
		LIMIT ?
	`

	rows, err := chConn.Query(ctx, query, siteID, limit)
	if err != nil {
		log.Printf("Failed to query errors: %v", err)
		http.Error(w, "Failed to fetch errors", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type ErrorActivity struct {
		Timestamp time.Time `json:"timestamp"`
		Type      string    `json:"type"`
		URL       string    `json:"url"`
		Message   string    `json:"message"`
		Source    string    `json:"source"`
		LineNo    uint32    `json:"lineno"`
		IP        string    `json:"ip"`
	}

	var activities []ErrorActivity

	for rows.Next() {
		var activity ErrorActivity
		activity.Type = "error"

		err := rows.Scan(
			&activity.Timestamp,
			&activity.URL,
			&activity.Message,
			&activity.Source,
			&activity.LineNo,
			&activity.IP,
		)
		if err != nil {
			log.Printf("Error scanning error activity: %v", err)
			continue
		}

		activities = append(activities, activity)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"activities": activities,
		"count":      len(activities),
	})
}
