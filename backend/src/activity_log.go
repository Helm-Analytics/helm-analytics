package sentinel

import (
	"database/sql"
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

// GetActivityLogHandler returns activity log for a site
func GetActivityLogHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	filter := r.URL.Query().Get("filter") // "all", "pageviews", "events", "visitors"
	limit := parseIntOrDefault(r.URL.Query().Get("limit"), 50)

	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	// Verify ownership
	if !verifySiteOwnership(r, siteID) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Build query based on filter
	query := `
		SELECT id, site_id, activity_type, activity_data, ip_address, 
		       country, city, browser, os, device, created_at
		FROM activity_log
		WHERE site_id = $1
	`

	var args []interface{}
	args = append(args, siteID)

	switch filter {
	case "pageviews":
		query += " AND activity_type = $2"
		args = append(args, ActivityPageview)
	case "events":
		query += " AND activity_type = $2"
		args = append(args, ActivityCustomEvent)
	case "visitors":
		query += " AND activity_type = $2"
		args = append(args, ActivityVisitorNew)
	}

	query += " ORDER BY created_at DESC LIMIT $" + string(rune(len(args)+1))
	args = append(args, limit)

	rows, err := db.Query(query, args...)
	if err != nil {
		log.Printf("Failed to query activity log: %v", err)
		http.Error(w, "Failed to fetch activity log", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var activities []ActivityLogEntry

	for rows.Next() {
		var activity ActivityLogEntry
		var dataJSON []byte
		var activityTypeStr string
		var id, siteID sql.NullString
		var ip, country, city, browser, os, device sql.NullString

		err := rows.Scan(
			&id, &siteID, &activityTypeStr, &dataJSON,
			&ip, &country, &city, &browser, &os, &device,
			&activity.CreatedAt,
		)
		if err != nil {
			log.Printf("Error scanning activity: %v", err)
			continue
		}

		activity.ID = id.String
		activity.SiteID = siteID.String
		activity.ActivityType = ActivityType(activityTypeStr)
		activity.IPAddress = ip.String
		activity.Country = country.String
		activity.City = city.String
		activity.Browser = browser.String
		activity.OS = os.String
		activity.Device = device.String

		// Parse activity data
		if err := json.Unmarshal(dataJSON, &activity.ActivityData); err != nil {
			activity.ActivityData = make(map[string]interface{})
		}

		activities = append(activities, activity)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"activities": activities,
		"count":      len(activities),
	})
}
