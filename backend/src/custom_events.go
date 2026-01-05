package sentinel

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

// CustomEventPayload represents a custom event from the client
type CustomEventPayload struct {
	SiteID     string                 `json:"siteId"`
	SessionID  string                 `json:"sessionId"`
	EventName  string                 `json:"eventName"`
	Properties map[string]interface{} `json:"properties"`
	URL        string                 `json:"url"`
	Referrer   string                 `json:"referrer"`
}

// TrackCustomEventHandler handles custom event tracking
func TrackCustomEventHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var payload CustomEventPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if payload.SiteID == "" || payload.EventName == "" {
		http.Error(w, "siteId and eventName are required", http.StatusBadRequest)
		return
	}

	// Get client info
	clientIP := getClientIP(r)
	userAgent := r.UserAgent()
	
	// Enrich event data
	country := getCountry(clientIP)
	city := getCity(clientIP)
	browser := getBrowser(userAgent)
	os := getOS(userAgent)
	device := getDevice(userAgent)

	// Serialize properties to JSON
	propsJSON, err := json.Marshal(payload.Properties)
	if err != nil {
		propsJSON = []byte("{}")
	}

	// Store in ClickHouse
	query := `
		INSERT INTO events (
			SiteID, EventType, EventName, Properties, 
			URL, Referrer, ClientIP, Country, City, 
			Browser, OS, Device, UserAgent, Timestamp, SessionID
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	ctx := context.Background()
	err = chConn.AsyncInsert(ctx, query, false,
		payload.SiteID,
		"custom",
		payload.EventName,
		string(propsJSON),
		payload.URL,
		payload.Referrer,
		clientIP,
		country,
		city,
		browser,
		os,
		device,
		userAgent,
		time.Now(),
		payload.SessionID,
	)

	if err != nil {
		log.Printf("Error storing custom event: %v", err)
		http.Error(w, "Failed to store event", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"message": "Event tracked successfully",
	})
}

// GetCustomEventsHandler returns custom event statistics
func GetCustomEventsHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	days := parseIntOrDefault(r.URL.Query().Get("days"), 30)

	if siteID == "" {
		http.Error(w, "siteId is required", http.StatusBadRequest)
		return
	}

	// Verify site ownership
	if !verifySiteOwnership(r, siteID) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Query custom events
	query := `
		SELECT 
			EventName,
			count() as Count,
			uniqExact(SessionID) as UniqueUsers,
			countIf(Properties != '{}') as WithProperties
		FROM events
		WHERE SiteID = ?
			AND EventType = 'custom'
			AND Timestamp >= now() - INTERVAL ? DAY
		GROUP BY EventName
		ORDER BY Count DESC
		LIMIT 100
	`

	ctx := context.Background()
	rows, err := chConn.Query(ctx, query, siteID, days)
	if err != nil {
		log.Printf("Error querying custom events: %v", err)
		http.Error(w, "Failed to fetch events", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	type EventStat struct {
		EventName      string `json:"eventName"`
		Count          int64  `json:"count"`
		UniqueUsers    int64  `json:"uniqueUsers"`
		WithProperties int64  `json:"withProperties"`
	}

	var events []EventStat
	for rows.Next() {
		var stat EventStat
		if err := rows.Scan(&stat.EventName, &stat.Count, &stat.UniqueUsers, &stat.WithProperties); err != nil {
			continue
		}
		events = append(events, stat)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"events": events,
		"period": days,
	})
}

// GetEventPropertiesHandler returns property breakdown for a specific event
func GetEventPropertiesHandler(w http.ResponseWriter, r *http.Request) {
	siteID := r.URL.Query().Get("siteId")
	eventName := r.URL.Query().Get("eventName")
	days := parseIntOrDefault(r.URL.Query().Get("days"), 30)

	if siteID == "" || eventName == "" {
		http.Error(w, "siteId and eventName are required", http.StatusBadRequest)
		return
	}

	if !verifySiteOwnership(r, siteID) {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}

	// Get sample properties
	query := `
		SELECT Properties
		FROM events
		WHERE SiteID = ?
			AND EventType = 'custom'
			AND EventName = ?
			AND Timestamp >= now() - INTERVAL ? DAY
			AND Properties != '{}'
		LIMIT 1000
	`

	ctx := context.Background()
	rows, err := chConn.Query(ctx, query, siteID, eventName, days)
	if err != nil {
		http.Error(w, "Failed to fetch properties", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	// Aggregate property values
	propertyStats := make(map[string]map[string]int64)

	for rows.Next() {
		var propsJSON string
		if err := rows.Scan(&propsJSON); err != nil {
			continue
		}

		var props map[string]interface{}
		if err := json.Unmarshal([]byte(propsJSON), &props); err != nil {
			continue
		}

		// Count occurrences of each property value
		for key, value := range props {
			if propertyStats[key] == nil {
				propertyStats[key] = make(map[string]int64)
			}
			valueStr := toString(value)
			propertyStats[key][valueStr]++
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"eventName":  eventName,
		"properties": propertyStats,
		"period":     days,
	})
}

func toString(v interface{}) string {
	switch val := v.(type) {
	case string:
		return val
	case float64:
		return fmt.Sprintf("%.0f", val)
	case bool:
		return fmt.Sprintf("%t", val)
	default:
		return fmt.Sprintf("%v", val)
	}
}
