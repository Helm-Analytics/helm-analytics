package sentinel

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type SessionPayload struct {
	SiteID    string          `json:"siteId"`
	SessionID string          `json:"sessionId"`
	Events    json.RawMessage `json:"events"`
}

type SessionData struct {
	Timestamp time.Time
	SiteID    string
	SessionID string
	Events    json.RawMessage
}

func SessionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "POST" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var payload SessionPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	sessionID := payload.SessionID
	if sessionID == "" {
		sessionID = uuid.New().String()
	}

	sessionData := SessionData{
		Timestamp: time.Now().UTC(),
		SiteID:    payload.SiteID,
		SessionID: sessionID,
		Events:    payload.Events,
	}

	// Insert into ClickHouse with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	err := chConn.Exec(ctx, `INSERT INTO sentinel.session_events 
		(Timestamp, SiteID, SessionID, Payload) 
		VALUES (?, ?, ?, ?)`,
		sessionData.Timestamp,
		sessionData.SiteID,
		sessionData.SessionID,
		string(sessionData.Events), // Convert events to string for storage
	)
	if err != nil {
		log.Printf("Error inserting session into ClickHouse: %v", err)
		// Don't fail the request - session replay is not critical
		// Just return success to avoid blocking the tracker
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "accepted", "sessionId": sessionID})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "ok", "sessionId": sessionID})
}

func GetSessionEventsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	siteID := r.URL.Query().Get("siteId")
	sessionID := r.URL.Query().Get("sessionId")

	if siteID == "" || sessionID == "" {
		http.Error(w, "siteId and sessionId query parameters are required", http.StatusBadRequest)
		return
	}

	// Verify site ownership
	if !verifySiteOwnership(r, siteID) {
		http.Error(w, `{"error": "Unauthorized access to site"}`, http.StatusUnauthorized)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	query := "SELECT Payload FROM session_events WHERE SiteID = ? AND SessionID = ? ORDER BY Timestamp ASC"
	rows, err := chConn.Query(ctx, query, siteID, sessionID)
	if err != nil {
		log.Printf("Error querying session events from ClickHouse: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var allEvents []json.RawMessage
	for rows.Next() {
		var payloadStr string
		if err := rows.Scan(&payloadStr); err != nil {
			log.Printf("Error scanning session event payload: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		// The payload is already a JSON array of rrweb events, but stored as a string.
		// We need to unmarshal it and then append its elements to allEvents.
		var eventsInPayload []json.RawMessage
		if err := json.Unmarshal([]byte(payloadStr), &eventsInPayload); err != nil {
			log.Printf("Error unmarshaling session events from payload: %v", err)
			// Depending on strictness, you might want to skip this payload or return an error
			continue
		}
		allEvents = append(allEvents, eventsInPayload...)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(allEvents)
}

func ListSessionsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	siteID := r.URL.Query().Get("siteId")
	if siteID == "" {
		http.Error(w, "siteId query parameter is required", http.StatusBadRequest)
		return
	}

	// Verify site ownership
	if !verifySiteOwnership(r, siteID) {
		http.Error(w, `{"error": "Unauthorized access to site"}`, http.StatusUnauthorized)
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	query := `
		SELECT 
			SessionID, 
			min(Timestamp) as start_time 
		FROM session_events 
		WHERE SiteID = ? 
		GROUP BY SessionID 
		ORDER BY start_time DESC 
		LIMIT 20`
	rows, err := chConn.Query(ctx, query, siteID)
	if err != nil {
		log.Printf("Error querying session IDs from ClickHouse: %v", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var sessionIDs []string
	for rows.Next() {
		var sessionID string
		var startTime time.Time
		if err := rows.Scan(&sessionID, &startTime); err != nil {
			log.Printf("Error scanning session ID: %v", err)
			http.Error(w, "Internal server error", http.StatusInternalServerError)
			return
		}
		sessionIDs = append(sessionIDs, sessionID)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(sessionIDs)
}
